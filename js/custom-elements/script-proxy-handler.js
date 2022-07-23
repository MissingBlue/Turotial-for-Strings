import AppProxyHandler from './app-proxy-handler.js';

// AppNode.prototype.play が実行された時に、
// そこで選択される要素を第一引数 target に指定して作成される Proxy の第二引数 handler に与えられるオブジェクト。
// コンストラクターは存在せず、静的プロパティ、メソッドを含め、このオブジェクトを独立して使用することは想定していない。
// このオブジェクトは、Proxy を通じて、target の @@iterator, @@asyncIterator をトラップし、
// target がそれらのプロパティを持たない場合、代わりにその機能を提供することを目的としている。
// @@asyncIterator をトラップされた要素は、再帰してそのすべての子要素にも同様の Proxy を作成し、@@asyncIterator を実行する。
// これにより、そうすることを想定していない要素（例えばビルトインのもの）も含め、
// すべての要素に暗黙的かつ非破壊的に同期、非同期反復可能オブジェクトとしての機能を与え、また振舞わせることが可能になる。
// target は、再帰前に任意に実装されたメソッド target.prototype.play の実行を試みる。
// このメソッドの実行スコープは target ではなく、それを指定して作られた Proxy になる。
// これは通常問題になることはないが、Proxy を通じて target のプロトタイプチェーンを辿る処理を行なう関数を取得して実行した場合、
// その関数の実行中にエラーが発生する可能性がある。これは例えば各種インターフェースを継承する HTML 要素で起きる可能性が高い。
// この問題に対応するために、このオブジェクトでは、自身のプロパティではないプロパティが持つ関数を返す際、
// それを Function.prototype.apply(target, arguments) で実行する別の関数を返すようにしている。
// これにより、Proxy を使う処理側では、この問題を意識せずにプロパティの関数を実行することができるが、
// 一方でその関数がジェネレーター関数や非同期関数だった場合、状況によっては対応を迫られるケースが出てくるかもしれない。
// play には任意の戻り値が指定できるが、戻り値が後続の処理に影響ないし反映されることはない。
// ただし、Promise を戻り値にした場合は、その解決を待ってから子要素への再帰を開始する。
export default class ScriptProxyHandler {
	
	static {
		
		this.asyncValueOf = Symbol('ScriptProxyHandler.asyncValueOf'),
		
		this[this.iteratorName = Symbol('ScriptProxyHandler.iteratorName')] = 'children',
		
		this[this.begin = Symbol('ScriptProxyHandler.begin')] = 'play',
		this[this.end = Symbol('ScriptProxyHandler.end')] = 'played',
		
		this.noRecursion = Symbol('ScriptProxyHandler.noRecursion'),
		
		this[this.callbackName = Symbol('ScriptProxyHandler.callbackName')] = async function (proxy, shared) {
			
			const	{ fulfill, begin, end, dataset: { assign } } = this,
					sync = this.dataset?.sync?.split?.(' ');
			let played;
			
			typeof this[begin] === 'function' && (
					played = !sync || sync.indexOf('play') === -1 ?	await this[begin](this, shared) :
																					this[begin](this, shared)
				);
			
			if (this.constructor[ScriptProxyHandler.noRecursion]) return;
			
			switch (fulfill) {
				
				case 'all': case 'all-settled': case 'any': case 'race':
				await Promise[fulfill === 'all-settled' ? 'allSettled' : fulfill](this[ScriptProxyHandler.asyncValueOf]);
				break;
				
				default:
				
				const asyncIterator = this[Symbol.asyncIterator](shared);
				
				for await (const v of asyncIterator);
				
			}
			
			typeof this[end] === 'function' && (
					!sync || sync.indexOf('played') === -1 ?	await this[end](this, shared, played) :
																			this[end](this, shared, played)
				);
			
			this.assignData(shared),
			
			this.dispatchEvent(new CustomEvent('played', { detail: this }));
			
		},
		
		this.assignData = AppProxyHandler.assignData,
		this.getFinally = AppProxyHandler.getFinally;
		
	};
	
	// それぞれのメソッド内で、this は ScriptProxyHandler、target は Proxy の第一引数に与えたオブジェクト、
	// receiver は Proxy のコンストラクターで作成したインスタンスを示す。
	
	static get(target, property, receiver) {
		
		switch (property) {
			
			case ScriptProxyHandler.asyncValueOf:
			
			const { callbackName } = ScriptProxyHandler, promises = [];
			let i,v;
			
			i = -1;
			for (const proxied of receiver)
				promises[++i] = (v = proxied?.[callbackName]?.(proxied)) instanceof Promise || Promise.resolve(v);
			
			return promises;
			
			case 'fulfill':
			return target.getAttribute('fulfill');
			
			case 'iteratorName': case 'callbackName': case 'begin': case 'end':
			return (property = this[property]) in target.constructor ? target.constructor[property] : this[property];
			
		}
		
		// *** 以下の説明は非常に曖昧な理解と不完全な検証に基づいて書かれた考察で、誤りを含む可能性が高い ***
		// property が示す target のプロパティの値が Function だった場合、
		// その関数内で target が継承するインターフェースを使う処理がある場合、
		// 例えば HTMLDivElement で、それが継承するインターフェース Element が定義する children を取得した場合、
		// 関数の実行対象が this などの Proxy、つまりこの get の実行元であれば、その処理はエラーを起こす。
		// このエラーの原因は特定できないが、内部で Proxy を taget そのものとして扱おうとしている可能性が高い。
		// その関数がシステムが定義する関数だった場合、現状ではこのエラーに対応する方法が見つからない。
		// そのため、プロパティが返す値が関数で、かつそれが target の自身のプロパティではなく、
		// そのプロトタイプチェーン上に存在する場合、その関数はシステム上の関数である可能性が高いものとして、
		// その関数を target で実行した戻り値を返す匿名関数でラップして返すようにしている。
		// これは戻り値だけ見れば、target を実行元にした場合と同じ戻り値を得られるが、
		// プロパティが示す関数が非同期関数やジェネレーター関数だった場合、
		// 呼び出し元が存在する処理内で、それを想定した処理と不整合を引き起こす可能性が考えられるが、
		// 一方で yield* などで対応できる余地も残されているものと思われる。（未検証）
		
		return this.getFinally(...arguments);
		
	}
	
	static set(target, property, value) {
		
		switch (property) {
			
			case 'fulfill':
			target.setAttribute('fulfill', v);
			return true;
			
			default:
			return Relflect.set(...arguments);
			
		}
		
		return false;
		
	}
	
	static *[Symbol.iterator]() {
		
		for (const v of this[this.iteratorName]) yield Proxy.revocable(v, ScriptProxyHandler);
		
	}
	
	static async *[Symbol.asyncIterator](shared) {
		
		const { callbackName } = ScriptProxyHandler;
		
		for (const { proxy, revoke } of this) await proxy?.[callbackName]?.(proxy, shared), yield proxy, revoke();
		
	}
	
}