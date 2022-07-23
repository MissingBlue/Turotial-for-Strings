import { Chr, Composer, ParseHelper, Pattern, default as strings, Terms } from './strings.js';
import { ComputeNode, EventBridge, IndexedBlock, PackNode, PackedNode } from './compute.js';

document.getElementById('console-node').content.querySelector('input').value =
	'hi';

class Property {
	
	static num(value, min = -Infinity, max = Infinity, flag = 0, defaultValue = 0, coefficient = 1) {
		
		const { toNaNaN } = Property;
		
		value = typeof coefficient === 'function' ? coefficient(value, min, max, flag, defaultValue, coefficient) :
			((value = toNaNaN(value, defaultValue) * toNaNaN(coefficient, 1)) < min ? min : value > max ? max : value),
		
		flag & Property.IS_INTEGER && value !== Infinity && (value = value|0),
		value < 0 && (flag & Property.IS_UNSIGNED && (value = min > 0 ? min : 0));
		
		return value;
		
	}
	static toNaNaN(value, defaultValue) {
		
		return Number.isNaN(value = +value) ? defaultValue : value;
		
	}
	static normalize(value, flag, defaultValue) {
		
		return Property.num(value, value, value, flag, defaultValue);
		
	}
	
	static {
		
		this.IS_INTEGER = 1,
		this.IS_UNSIGNED = 2;
		
	}
	
	constructor(value, min, max, flag, defaultValue, coefficient) {
		
		this.set(...arguments);
		
	}
	
	valueOf() {
		
		return Property.num(this.value, this.min, this.max, this.flag, this.defaultValue, this.coefficient);
		
	}
	
	get() {
		
		return +this;
		
	}
	set(
		value,
		min = this.min ?? -Infinity,
		max = this.max ?? Infinity,
		flag = this.flag ?? 0,
		defaultValue = this.defaultValue,
		coefficient = this.coefficient ?? 1
	) {
		
		arguments.length === 1 || (
				
				this.setMin(min),
				this.setMax(max),
				
				this.flag = flag,
				this.defaultValue = defaultValue,
				this.coefficient = coefficient
				
			);
		
		return this.value = Property.num(value, this.min, this.max, this.flag, this.defaultValue, this.coefficient);
		
	}
	
	setMin(value, flag, defaultValue = -Infinity) {
		
		return this.setPropertyValue('min', value, value, value, flag, defaultValue);
		
	}
	setMax(value, flag, defaultValue = Infinity) {
		
		return this.setPropertyValue('max', value, flag, defaultValue);
		
	}
	setPropertyValue(name, value, flag = this.flag, defaultValue) {
		
		return this[name] = Property.normalize(value, flag, defaultValue);
		
	}
	
	// 以下の関数群の引数 returnsValue に真を示す値を指定すると、関数の戻り値が this.value ではなく、引数 value になる。
	// 以下の関数群は this.value [operator] value で計算を行なうが、引数 inverts に真を示す値を指定すると、
	// value [operator] this.value で計算を行なう。（つまり左辺と右辺を入れ替える）
	add(value, returnsValue, inverts) {
		
		return this.cal('+', value, returnsValue, inverts);
		
	}
	sub(value, returnsValue, inverts) {
		
		return this.cal('-', value, returnsValue, inverts);
		
	}
	mul(value, returnsValue, inverts) {
		
		return this.cal('*', value, returnsValue, inverts);
		
	}
	div(value, returnsValue, inverts) {
		
		return this.cal('/', value, returnsValue, inverts);
		
	}
	cal(operator, value, returnsValue, inverts) {
		
		value = Property.num(value);
		
		const b = inverts ? this.value : value;
		let a = inverts ? value : this.value;
		
		switch (operator) {
			case 'addition': case 'add': case '+': a += b; break;
			case 'subtruct': case 'sub': case '-': a -= b; break;
			case 'multiple': case 'mul': case '*': a *= b; break;
			case 'division': case 'div': case '/': a /= b; break;
			default: a = b;
		}
		
		a = this.set(a);
		
		return returnsValue ? value : a;
		
	}
	
}

class Game {
	
	static executor = {
		
		browse(type) {
			
			const contents = [], { isNotLog } = Game;
			
			switch (type) {
				default:
				const content = document.createElement('iframe');
				content.src = type,
				content.sandbox = 'allow-same-origin',
				content[isNotLog] = true,
				contents[contents.length] = content;
			}
			
			return contents;
			
		}
		
	}
	
	static {
		
		this.isNotLog = Symbol('Game.isNotLog');
		
		this.GlobalPropertyFlag = Property.IS_INTEGER + Property.IS_UNSIGNED,
		this.GlobalCoefficient = new Property(1);
		
		const { create, browse } = this.executor;
		
		this.command = {
			
			browse
			
		};
		
	}
	
	constructor() {
		
		this.instance = new Instance();
		
	}
	
	execute(executor, args) {
		
		const	{ command } = Game,
				exe = executor in command ? command : `No command such "${executor}".`,
				result = typeof exe === 'function' ? exe.apply(this, args) : exe;
		
		return result;
		
	}
	
}

class Instance {
	
	static {
		
	}
	
	constructor() {
		
		
	}
	
}

// Parser

class Parser extends ParseHelper {
	
	static branch(mask, masks, input, detail, self) {
		
		const	values = mask.inners[0].split(this.separator), l = values.length,
				dict = this[Terms.dict],
				s = Parser[ParseHelper.symbol],
				hyphen = dict[s.hyphen],
				integer = dict[s.integer],
				v = [];
		let i,i0,l0,i1, vi, value,value0;
		
		i = vi = -1;
		while (++i < l) {
			
			if (
				(value = values[i].trim()).search(hyphen).length !== -1 &&
				(l0 = (value0 = value.split(hyphen)).length) === 2
			) {
				
				i0 = -1;
				while (++i0 < l0 && ((!i && !value0[i]) || integer.test(value0[i])));
				if (i0 === l0) {
					
					i0 = (value0[0]|0) + (i1 = -1), l0 = (value0[1]|0) + 1;
					while (++i0 < l0) v[++vi] = i0;
					continue;
					
				}
				
			}
			
			v[++vi] = value;
			
		}
		
		return { v };
		
	}
	
	static createDict(indexOfSymbol, dict = {}, source = Parser.dict) {
		
		let k;
		
		for (k in source) dict[indexOfSymbol[k]] = source[k];
		
		return dict;
		
	}
	
	static {
		
		this[ParseHelper.esc] = null,
		
		this[ParseHelper.symbolNames] = [
			
			'brh',
			
			'branchLeft',
			'branchRight',
			
			'hyphen',
			
			'separator',
			
			'integer'
			
		];
		
		const	s = ParseHelper.setSymbols(this),
				dict = this.dict =	{
												
												[s.branchLeft]: new Pattern('['),
												[s.branchRight]: new Pattern(']'),
												
												[s.hyphen]: new Pattern('-'),
												
												[s.separator]: new Pattern(','),
												
												[s.integer]: /[\d０-９]*/g
												
											};
		
		this[ParseHelper.precedenceDescriptors] = [
			{ name: s.brh, term: [ s.branchLeft, s.branchRight ], esc: null, isFlat: true, callback: Parser.branch }
		];
		
	}
	
	constructor(configuration, esc = null, dict) {
		
		super(
			configuration,
			Parser,
			esc,
			{ ...Parser.dict, ...(dict && typeof dict === 'object' ? dict : {}) }
		);
		
		const d = this[Terms.dict], s = Parser[ParseHelper.symbol];
		
		this.separator = new Chr(d[s.separator], null),
		this.counter = new Chr([ d[s.integer], '?', d[s.hyphen], d[s.integer] ], null);
		
	}
	
	parse(str) {
		
		const commands = this.split(str, undefined, this.separator), l = commands.length;
		let i, cmd;
		
		i = -1;
		while (++i < l) (cmd = commands[i].trim()) && (commands[i] = this.get(cmd));
		
		return Composer.compose(commands.flat());
		
	}
	
	//[ParseHelper.main](block, parsed, plot, plotLength, input, detail, self) {
	//	
	//}
	
}

// Custom Elements

// スクリプト関連

// 静的プロパティ subscriptions に指定された記述子が示すイベントハンドラーをインスタンスに登録する。
// ハンドラーは、インスタンスのプロパティ subscriber に記録されるが、継承先ではこのプロパティを意識する必要はない。
// 継承先で実装する必要があるのは subscriptions と、connectedCallback 内での subscribe の実行である。
// このスクリプトのカスタム要素は utils.js の CustomElement を継承し、
// CustomElement では（正確には CustomElement が継承する ExtensionNode では）イベントリスナーの管理を一元化して一括して行なうが、
// それでは不十分だった、一括して、かつ部分的にイベントリスナーを登録、削除したい場合に対応する機能を提供するのがこのカスタム要素の目的。
class SubscriptionNode extends CustomElement {
	
	static {
		
		this.to = Symbol('SubscriptionNode.to'),
		this.noSubscriptionArgs = Symbol('SubscriptionNode.noSubscriptionArgs');
		
	}
	
	constructor() {
		
		super();
		
		this.subscriptionsAC = new AbortController(),
		
		this.createSubscribers(undefined, this.subscriber = {});
		
	}
	
	createSubscribers(subscriptions = this.__.subscriptions, subscriber) {
		
		const l = subscriptions?.length;
		
		if (!l || !Array.isArray(subscriptions) || !subscriber || typeof subscriber !== 'object') return;
		
		const { noSubscriptionArgs, to } = this.__;
		let i, subscription, handler, thisArg, args;
		
		i = -1;
		while (++i < l) {
			
			typeof (handler = (subscription = subscriptions[i]).handler) === 'function' && (
					
					thisArg = 'thisArg' in subscription ? subscription.thisArg : this,
					args = 'args' in subscription ?
						Array.isArray(args = subscription.args) ? args : [ args ] : noSubscriptionArgs,
					
					(
						subscriber[subscription.key ||= Symbol(`SubscriptionNode.subscriptions[${i}]`)] =
							args === noSubscriptionArgs ? handler.bind(thisArg) : handler.bind(thisArg, ...args)
					)[to] = subscription.to || ':scope'
					
				);
			
		}
		
	}
	
	// SubscriptionNode.prototype.subscribe は、継承先の connectedCallback 内で実行されることを想定している。
	// 継承先はその実行処理を実装する必要がある。
	subscribe(subscriptions = this.__.subscriptions, subscriber = this.subscriber, ac = this.bscriptionsAC) {
		
		const l = subscriptions?.length;
		
		if (!l || !Array.isArray(subscriptions) || !subscriber || typeof subscriber !== 'object') return;
		
		const { to } = this.constructor;
		let i, signal;
		
		i = -1, ac instanceof AbortController && (ac.abort(), signal = ac.signal);
		while (++i < l) {
			
			const { type, option, key } = subscriptions[i], handler = subscriber[key];
			
			this.composeClosest(handler[to])?.addEventListener?.(
					type,
					handler,
					option && typeof option === 'object' ?
						{ ...option, signal } : signal ? { signal, useCapture: !!option } : !!option
				);
			
		}
		
	}
	unsubscribe() {
		
		this.subscriptionsAC.abort();
		
	}
	
}

class AppProxyHandler {
	
	static {
		
	}
	
	static get() {
		
		return this.getFinally(...arguments);
		
	}
	
	static assignData(data) {
		
		const { assign, assignType, assignValue } = this.dataset;
		
		if (assign) {
			
			switch (assignType) {
				case 'string': data[assign] = this.textContent; break;
				case 'number': data[assign] = +this.textContent; break;
				case 'boolean': data[assign] = !!this.textContent; break;
				case 'undefined': data[assign] = void this.textContent; break;
				default:
				try {
					
					data[assign] = JSON.parse(this.textContent);
					
				} catch (error) {
					
					data[assign] = this.textContent.trim();
					
				}
			}
			
		}
		
		assignValue && (data[assignValue] = this.valueOf());
		
	}
	
	static getFinally(target, property, receiver) {
		
		return	target.hasOwnProperty(property) ?
						Reflect.get(...arguments) :
						property in target ?
							typeof (property = target[property]) === 'function' ?
								// 以下の処理は場当たり的な対応で、処理できる理由もすべての状況において正しいかどうかも確認できていない。
								// 意図としては、get で呼び出された関数を Proxy でラップし
								// その関数のプロパティを取得する場合はその Proxy 越しに、
								// 関数本体を実行する場合は、それをトラップして、get を実行した Proxy の target を thisArg にして実行することで、
								// 関数のプロパティを取得する操作と、関数本体を実行する時とで、その実行元を切り替える処理を行なっている。
								// これは、例えば target.constructor.a で、constructor は関数なので、
								// Proxy でラップしなければ、a は、constructor をラップする匿名関数のプロパティとして取得される。
								// 一方、constructor をそのまま返すと、constructor を関数として実行した時に、
								// receiver.constructor() と言う形になり、constructor 内の処理によっては不整合が起きることがある。
								// これは construtor 特有の問題と言う訳ではなく、すべての関数に起こり得る状況で、あくまで一例である。
								// この二つの状況に対応するために、関数本体のあるべき実行状況をクロージャによって保存した上で Proxy から呼びだせるようにし、
								// 一方で関数本体が持つプロパティは関数そのもののプロパティとして返すようにしている。
								// 可能であればこの Proxy を Proxy.revocable から作成して、本体が revoke されたら同様に revoke するようにしたい。
								new Proxy(
									property,
									{
										apply(f, thisArg, args) {
											return f === property ? property.apply(target, args) : Reflect.apply(...arguments);
										}
									}
								) :
								property :
							this[property];
		
	}
	
}

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
class ScriptProxyHandler {
	
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

class SNode extends SubscriptionNode {
	
	static bound = {
		
	};
	
	static acc = {
		
		content(name, oldValue, newValue) {
			
			this.setContent(newValue);
			
		}
		
	};
	
	static {
		
		this.slotName = 'content',
		
		this.tagName = 's-node',
		
		this[ScriptProxyHandler.iteratorName] = 'assignedNodes';
		
	}
	
	constructor() {
		
		super(),
		
		this.setContent();
		
	}
	attributeChangedCallback(name, oldValue, newValue) {
		
		this.acc?.[name]?.(name, oldValue, newValue);
		
	}
	
	play() {
		
		return Promise.resolve();
		
	}
	
	setContent(selector = this.content, appends = this.appends) {
		
		if (selector !== this.content) {
			
			this.content = selector;
			return;
			
		}
		
		appends || this.removeContent();
		
		const contents = document.querySelectorAll(selector), l = contents.length;
		
		if (!l) return;
		
		const contentNode = document.createElement('div');
		let i;
		
		i = -1, contentNode.slot = this.slotName;
		while (++i < l) contentNode.appendChild(contents[i].content.cloneNode(true));
		
		this.appendChild(contentNode);
		
	}
	removeContent() {
		
		const { assignedNodes } = this;
		
		if (assignedNodes) for (const v of assignedNodes) v.remove();
		
	}
	
	get slotName() {
		
		return this.constructor.slotName || SNode.slotName;
		
	}
	get slotQuery() {
		
		return `slot[name="${this.slotName}"]`;
		
	}
	get assignedNodes() {
		
		return this.shadowRoot.querySelector(this.slotQuery)?.assignedNodes?.() || [];
		
	}
	
	get content() {
		
		return this.getAttribute('content');
		
	}
	set content(v) {
		
		this.setAttribute('content', v);
		
	}
	get appends() {
		
		return this.getAttribute('appends');
		
	}
	set appends(v) {
		
		this[(v === false ? 'remove' : 'set') + 'Attribute']('appends', v);
		
	}
	
}

class AppNode extends CustomElement {
	
	static bound = {
		
		input({ detail: { target } }) {
			
			const { value } = target, inputs = value && this.parser.parse(value);
			
			this.emit('app-input', { target, inputs }),
			
			inputs?.length && this.run(inputs);
			
		},
		
		defined() {
			
			this.play();
			
		}
		
	};
	
	static {
		
		this.tagName = 'app-node',
		
		this[ScriptProxyHandler.iteratorName] = 'scenes',
		
		this.shadowElement = {
			
			dataNode: '#data'
			
		};
		
	}
	
	constructor(game = new Game(), parser = new Parser()) {
		
		if (!(game instanceof Game)) throw new TypeError('Argument 1 must be an instance of Game.');
		if (!(parser instanceof Parser)) throw new TypeError('Argument 2 must be an instance of Parser.');
		
		super();
		
		this.game = game,
		this.parser = parser,
		
		(this.heat = document.createElement('character-node')).dataset.data = '#character-heat',
		//(this.heat = document.createElement('character-node')).
		//	appendChild(document.getElementById('character-heat').content.cloneNode(true)),
		
		this.dataNode.appendChild(this.heat),
		
		this.addEventListener('console-input', this.input);
		
	}
	connectedCallback() {
		
		this.autoplay && customElements.whenDefined(this.tagName.toLowerCase()).then(this.defined);
		
	}
	
	async play(shared = {}) {
		
		const	{ proxy, revoke } = Proxy.revocable(this, ScriptProxyHandler),
				asyncIterator = proxy[Symbol.asyncIterator](shared);
		
		for await (const v of asyncIterator);
		
		revoke();
		
	}
	
	run(inputs) {
		
		this.process(this.parseAll(inputs)),
		this.process(this.heat.evaluateAll(inputs), this.heat.metadata);
		
	}
	
	parseAll(inputs) {
		
		const	{ iterator } = Symbol,
				l = (inputs = Array.isArray(inputs) ? inputs : [ inputs ]).length, data = [];
		let i,di, v;
		
		i = di = -1;
		while (++i < l) typeof (v = this.parse(inputs[i])) !== 'string' && typeof v[iterator] === 'function' ?
			(di = data.push(...v) - 1) : (data[++di] = v);
		
		return data;
		
	}
	
	parse(input) {
		
		return typeof input === 'string' ? this.game.execute((input = input.split(' '))[0], input.slice(1)) ?? '' : '';
		
	}
	
	process(data, placeholder) {
		
		const	l = (data = Array.isArray(data) ? data : [ data ]).length,
				browserNode = this.q('browser-node'),
				{ isNotLog } = this.game.constructor, logs = [];
		let i,i0;
		
		i = i0 = -1;
		while (++i < l) data[i][isNotLog] ? browserNode.setContent(i, data[i], true) : (logs[++i0] = data[i]);
		
		logs.length && this.addLogs(logs, placeholder);
		
	}
	
	addLogs(logs, placeholder) {
		
		if (!logs || !(Array.isArray(logs) ? logs : (logs = [ logs ])).length) return;
		
		const dialogNodes = this.qq('dialog-node'), l = dialogNodes.length;
		let i;
		
		i = -1;
		while (++i < l) dialogNodes[i].dialog?.addLogs?.(logs, placeholder);
		
	}
	
	disableConsoles(disables) {
		
		const consolesNodes = this.qq('consoles-node'), l = consolesNodes.length;
		let i;
		
		i = -1;
		while (++i < l) consolesNodes[i].disableConsoles(disables);
		
	}
	
	get autoplay() {
		
		return this.hasAttribute('autoplay');
		
	}
	set autoplay(v) {
		
		return v === false ? this.removeAttribute('autoplay') : this.setAttribute('autoplay', v);
		
	}
	
	get scenes() {
		
		return this.qq('#scenes > s-node');
		
	}
	
}

class EventListener extends SubscriptionNode {
	
	static bound = {
		
		async listened(event) {
			
			const { proxy, revoke } = Proxy.revocable(this, ScriptProxyHandler);
			
			for await (const handler of proxy);
			
			revoke();
			
		}
		
	};
	
	static acc = {
		
		selector(name, oldValue, newValue) {
			
			this.listen(newValue, this.type);
			
		},
		
		type(name, oldValue, newValue) {
			
			this.listen(this.selctor, newValue);
			
		},
		
	};
	
	static {
		
		this.tagName = 'event-listener',
		
		this[ScriptProxyHandler.noRecursion] = true;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	play() {
		
		this.listen();
		
	}
	
	attributeChangedCallback(name, oldValue, newValue) {
		
		this.acc?.[name]?.(name, oldValue, newValue);
		
	}
	
	listen(selector = this.selector, type = this.type) {
		
		const target = this.composeClosest('app-node')?.q(selector), { listenerAC, listend } = this;
		
		target && type && (
				listenerAC?.abort?.(),
				target.addEventListener(type, this.listened, { signal: (this.listenerAC = new AbortController()).signal })
			);
		
		
	}
	
	get selector() {
		
		return this.getAttribute('selector');
		
	}
	set selector(v) {
		
		this.setAttribute('selector', v);
		
	}
	
	get type() {
		
		return this.getAttribute('type');
		
	}
	set type(v) {
		
		this.setAttribute('type', v);
		
	}
	
}

// 論理演算を表現するカスタム要素

class ConditionProxyHandler {
	
	static {
		
		this.banList = new Set(),
		
		this.splices = Symbol('ConditionProxyHandler.splices'),
		
		this[this.iteratorName = Symbol('ConditionProxyHandler.iteratorName')] = 'children',
		this[this.handlerName = Symbol('ConditionProxyHandler.handlerName')] = 'evaluate',
		
		this[this.callbackName = Symbol('ConditionProxyHandler.callbackName')] = Symbol('ConditionProxyHandler.callback');
		
		this.assignData = AppProxyHandler.assignData,
		this.getFinally = AppProxyHandler.getFinally,
		
		this[this.data = Symbol('ConditionProxyHandler.data')] = new WeakMap(),
		
		this[this.callbackName] = async function (proxy, shared) {
			
			const { handlerName, tagName } = this, { splices } = ConditionProxyHandler;
			
			const asyncIterator = this[Symbol.asyncIterator](shared), values = [];
			let i;
			
			// ConditionBlock 以外の子要素はすべて logic="and" で評価される。
			// つまりその子要素の子要素中にひとつでも [handlerName] が示すメソッドに false を返すものがあれば、この子要素は false として判定される。
			
			i = -1;
			for await (const evaluated of asyncIterator)
				evaluated?.[splices] ? (i = values.push(...evaluated) - 1) : (values[++i] = evaluated);
			
			// メソッド target.prototype[ConditionProxyHandler.handlerName] を持たないオブジェクトはすべて true として判定する。
			
			const v = await this?.[handlerName]?.(values, shared);
			
			this.assignData(shared);
			
			return v;
			
		}
		
	}
	
	static get(target, property, receiver) {
		
		switch (property) {
			
			case 'iteratorName': case 'handlerName': case 'callbackName':
			return (property = this[property]) in target.constructor ? target.constructor[property] : this[property];
			
		}
		
		return this.getFinally(...arguments);
		
	}
	static set(target, property, value, receiver) {
		
		switch (property) {
			
			case 'fulfill':
			target.setAttribute('fulfill', value);
			return true;
			
			default: return Reflect.set(...arguments);
			
		}
		
		return false;
		
	}
	
	static *[Symbol.iterator]() {
		
		for (const v of this[this.iteratorName]) yield Proxy.revocable(v, ConditionProxyHandler);
		
	}
	
	static async *[Symbol.asyncIterator](shared) {
		
		const	{ callbackName } = this, sharedType = typeof shared;
		
		(shared && sharedType === 'object') ||
			(shared = { [ConditionBlock[sharedType === 'string' ? 'input' : 'anon']]: shared });
		
		// メソッド target.prototype[proxied.handlerName] を持たないオブジェクトはすべて true として判定する。
		for (const { proxy, revoke } of this) yield await proxy?.callbackName?.(proxy, shared), revoke();
		
	}
	
}

class ConditionBlock extends SubscriptionNode {
	
	static bound = {
		
	};
	
	static operator = {
		
		true(evaluated) {
			
			const l = evaluated.length, isOr = this.logic === 'or';
			let i;
			
			i = -1;
			while (++i < l && (isOr ? evaluated[i] === false : evaluated[i] !== false));
			
			return isOr ? i < l : i === l;
			
		},
		equal([ left, right ]) {
			
			return arguments[0].length < 2 || (this.strict ? left === right : left == right);
			
		},
		greater([ left, right ]) {
			
			return arguments[0].length < 2 || (left > right);
			
		},
		greaterEqual([ left, right ]) {
			
			return arguments[0].length < 2 || (left >= right);
			
		},
		less([ left, right ]) {
			
			return arguments[0].length < 2 || (left < right);
			
		},
		lessEqual([ left, right ]) {
			
			return arguments[0].length < 2 || (left <= right);
			
		}
		
	};
	
	static {
		
		// 覚え書き用、いずれのプロパティも現在は未使用
		
		this.op = [
			'true',		// 既定値、内包する要素が持つメソッド evaluate の戻り値が false を示す値でなければ真とする。
			'false',		// true の逆。実装上は存在せず、op="true" か、op未指定の時に not を指定すると同様の機能を果たす。
			'equal',		// 内包する condition-block の中から、直近の op="left", op="right" を示す二つの要素を一組だけ選び、その戻り値の等価を確認。
			'greater',
			'greater-equal',
			'less',
			'less-equal',
			'left', // 比較演算で内包されている時にのみ有効な値。比較の左辺であることを明示する。それ以外の機能は持たない。
			'right'
		],
		// op="true" ないし op が未指定の時にのみ有効な属性
		this.logic = [
			'and', // 既定値。内包する要素がすべて真を示す場合、真と評価する。
			'or' // 内包する要素の内、ひとつでも真を示せば、真と評価する。
		],
		
		//
		
		this.noReturnValue = Symbol('ConditionBlock.noReturnValue'),
		
		this[ScriptProxyHandler.noRecursion] = true,
		
		this.tagName = 'condition-block',
		
		this.input = Symbol('ConditionBlock.input'),
		this.anon = Symbol('ConditionBlock.anon'),
		
		this[ConditionProxyHandler.iteratorName] = 'evaluations',
		this.evaluationsSelectorBanList = new Set(),
		this.evaluationsSelector = ':scope > *',
		this.ban = (v = '') => typeof v === 'string' &&
			(this.evaluationsSelector = `:scope > :not(${[ ...this.evaluationsSelectorBanList.add(v) ].join(',')})`),
		this.unban = (v) => this.evaluationsSelectorBanList.remove(v) && this.ban(),
		
		this.comparisonOps = [ 'equal', 'greater', 'greater-equal', 'less', 'less-equal' ],
		this.comparisonSelectorLeft =
			`:scope > [op="left"], :scope > ${ConditionBlock.tagName}:not([op="right"]):nth-of-type(1)`,
		this.comparisonSelectorRight =
			`:scope > [op="right"], :is(${this.comparisonSelectorLeft}) ~ ${ConditionBlock.tagName}:not([op="left"])`,
		
		this.ops = {
			'greater-equal': 'greaterEqual',
			'less-equal': 'lessEqual',
			left: 'true',
			right: 'true'
		};
		
	}
	
	constructor() {
		
		super(),
		
		this.ops = ExtensionNode.bind(this.constructor.spread(this, 'operator'), this);
		
	}
	
	async play() {
		
		await this.begin();
		
	}
	
	async execute() {
		
		await this.begin();
		
	}
	
	async begin(shared) {
		
		const	{ proxy, revoke } = Proxy.revocable(this, ConditionProxyHandler),
				asyncIterator = proxy[Symbol.asyncIterator](shared),
				values = [];
		let i;
		
		i = -1;
		for await (const evaluated of asyncIterator) values[++i] = evaluated;
		
		const isTrue = await this.evaluate(values, shared);
		
		revoke();
		
		return isTrue;
		
	}
	
	async evaluate(values, shared) {
		
		const { op } = this;
		let isTrue;
		
		isTrue = this.ops[ConditionBlock.ops?.[op] || op]?.(values) ?? true, this.not && (isTrue = !isTrue);
		
		for (const exec of this.querySelectorAll('condition-' + isTrue)) await exec.execute(values, shared);
		
		return isTrue;
		
	}
	
	isComparison() {
		
		return ConditionBlock.comparisonOps.indexOf(this.op) !== -1;
		
	}
	
	get evaluations() {
		
		return this.isComparison() ?	[
													this.querySelector(ConditionBlock.comparisonSelectorLeft),
													this.querySelector(ConditionBlock.comparisonSelectorRight)
												] :
												this.querySelectorAll(ConditionBlock.evaluationsSelector);
		
	}
	
	get assignName() {
		
		this.getAttribute('assign-name');
		
	}
	set assignName(v) {
		
		this.setAttribute('assign-name', v);
		
	}
	
	get logic() {
		
		return this.getAttribute('logic')?.toLowerCase?.() ?? 'and';
		
	}
	set logic(v) {
		
		return this.setAttribute('logic', v);
		
	}
	
	get op() {
		
		return this.hasAttribute('op') ? this.getAttribute('op') : 'true';
		
	}
	set op(v) {
		
		this.setAttribute('op', v);
		
	}
	
	get strict() {
		
		return this.hasAttribute('strict');
		
	}
	set strict(v) {
		
		this[(v === false ? 'remove' : 'set') + 'Attribute']('strict', v);
		
	}
	get not() {
		
		return this.hasAttribute('not');
		
	}
	set not(v) {
		
		this[(v === false ? 'remove' : 'set') + 'Attribute']('not', v);
		
	}
	
}
// ConditionTrue, ConditionFalse が継承するオブジェクト
class ConditionExecution extends CustomElement {
	
	static bound = {
		
	};
	
	static {
		
		ConditionBlock.ban(this.tagName = 'condition-execution');
		
	}
	
	constructor() {
		
		super();
		
	}
	
	async play() {
		
		this.execute(shared);
		
	}
	
	async execute(shared) {
		
		const	{ proxy, revoke } = Proxy.revocable(this, ScriptProxyHandler),
				asyncIterator = proxy[Symbol.asyncIterator](shared);
		
		for await (const node of asyncIterator);
		
		revoke();
		
	}
	
}
class ConditionTrue extends ConditionExecution {
	
	static {
		
		ConditionBlock.ban(this.tagName = 'condition-true');
		
	}
	
	constructor() {
		
		super();
		
	}
	
}
class ConditionFalse extends ConditionExecution {
	
	static {
		
		ConditionBlock.ban(this.tagName = 'condition-false');
		
	}
	
	constructor() {
		
		super();
		
	}
	
}

// <reg-exp pattern="^\s*$" flags="" method="test" source="input"></reg-exp>
class RegExpNode extends SubscriptionNode {
	
	static bound = {
		
		mutated() {
			
			this.exec();
			
		}
		
	};
	
	static {
		
		this.tagName = 'reg-exp',
		
		this.mutationInit = { subtree: true, characterData: true };
		
	}
	
	constructor() {
		
		super();
		
		this.observeMutation(this.mutated, this, RegExpNode.mutationInit);
		
	}
	
	evaluate(values, shared) {
		
		return this.exec();
		
	}
	play(shared) {
		
		return this.exec();
		
	}
	
	exec(str) {
		
		const { method, replacer, source } = this, regexp = this[Symbol.toPrimitive]();
		
		switch (method) {
			
			case 'replace': return source[method](regexp, replacer);
			case 'replace-all': return source.replaceAll(regexp, replacer);
			
			default: return	typeof regexp[method] === 'function' ? regexp[method](source) :
										typeof source[method] === 'function' ? source[method](regexp) : pattern === source;
			
		}
		
	}
	
	get noTrim() {
		
		return this.hasAttribute('no-trim');
		
	}
	set noTrim(v) {
		
		return this[(v === false ? 'remove' : 'set') + 'Attribute']('no-trim', v);
		
	}
	get replacer() {
		
		return this.getAttribute('replacer') || '';
		
	}
	set replacer(v) {
		
		return this.setAttribute('replacer', v);
		
	}
	get method() {
		
		let v;
		
		switch (v = this.getAttribute('method').toLowerCase()) {
			
			case 'replace': case 'test': case 'match': case 'exec': return v;
			
			case 'replace-all': return 'replaceAll';
			case 'match-all': return 'matchAll'; 
			
			default: return 'test';
			
		}
		
	}
	get pattern() {
		
		return this.getAttribute('pattern');
		
	}
	set pattern(v) {
		
		this.setAttribute('pattern', v);
		
	}
	get flags() {
		
		this.getAttribute('flags');
		
	}
	set flags(v) {
		
		this.setAttribute('flags', v);
		
	}
	get source() {
		
		let v;
		
		switch (this.getAttribute('source').toLowerCase()) {
			
			case 'inner-html': v = this.innerHTML;
			case 'outer-html': v = this.outerHTML;
			case 'inner-text': v = this.innerText;
			default: v = this.textContent;
			
		}
		
		return this.noTrim ? v : v.trim();
		
	}
	set source(v) {
		
		this.setAttribute('source', v);
		
	}
	
	[Symbol.toPrimitive]() {
		
		return new RegExp(this.pattern, this.flags);
		
	}
	
}
// <query-selector selector="#dialogs .d-0" method="clone"></query-selector>
class QuerySelector extends SubscriptionNode {
	
	static {
		
		this.tagName = 'query-selector';
		
	}
	
	constructor() {
		
		super();
		
	}
	connectedCallback() {
		
		this.select();
		
	}
	
	async evaluate(values, shared) {
		
		const executed = this.select();
		hi(this);
		if (this.method === 'replace') {
			
			const values = [];
			let i, proxy;
			
			i = -1;
			for (const node of executed) {
				
				for await (const evaluated of (proxy = Proxy.revocable(node, ConditionProxyHandler)).proxy)
					values[++i] = evaluated;
				
				proxy.revoke();
				
			}
			// 以下のプロパティ名を示す ConditionProxyHandler のプロパティは現在未作成。
			values[ConditionProxyHandler?.splices] = true;
			
			return values;
			
		}
		
	}
	async play() {
		
		const played = this.select();
		
		if (this.method === 'replace') {
			
			let proxy;
			
			for (const node of played) {
				for await (const evaluated of (proxy = Proxy.revocable(node, ScriptProxyHandler)).proxy);
				proxy.revoke();
			}
			
		}
		
	}
	
	execute() {
		
		return this.select();
		
	}
	
	select(appends = this.appends) {
		
		const { selector } = this, selected = selector ? this.composeClosest('app-node').qq(selector) : [ this.children ];
		let l;
		
		if (!(l = selected.length)) return;
		
		//appends || (this.innerHTML = '');
		
		const { all, method, source } = this, executed = [];
		let i;
		
		i = -1, all || (l = 1);
		while (++i < l) {
			switch (source) {
				case 'value': executed[i] = selected[i]?.value ?? ''; break;
				default: executed[i] = selected[i].cloneNode(true);
			}
		}
		
		switch (method) {
			case 'append': this.append(...executed); break;
			case 'replace': default: this.replaceWith(...executed);
		}
		
		return executed;
		
	}
	
	//get appends() {
	//	
	//	return this.hasAttribute('appends');
	//	
	//}
	//set appends(v) {
	//	
	//	return this[(v === false ? 'remove' : 'set') + 'Attribute']('appends', v);
	//	
	//}
	// 選択要素をすべて対象とするか、最初のものだけにするかを指定する論理値。
	// いずれの場合も querySelectorAll が使われ、取得後に指定に従った要素を対象にする。
	get all() {
		
		return this.hasAttribute('all');
		
	}
	set all(v) {
		
		return this[(v === false ? 'remove' : 'set') + 'Attribute']('all', v);
		
	}
	get source() {
		
		return this.getAttribute('source')?.toLowerCase();
		
	}
	set source(v) {
		
		this.setAttribute('source', v);
		
	}
	get method() {
		
		return this.getAttribute('method')?.toLowerCase();
		
	}
	set method(v) {
		
		this.setAttribute('method', v);
		
	}
	get selector() {
		
		return this.getAttribute('selector');
		
	}
	set selector(v) {
		
		this.setAttribute('selector', v);
		
	}
	
}

class STimeout extends CustomElement {
	
	static {
		
		this.tagName = 's-timeout';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	evaluate() {
		
		return this.setTimeout();
		
	}
	
	play(proxy, shared) {
		
		return this.setTimeout();
		
	}
	
	played(proxy, shared, played) {
		
		return this.dataset.sync?.split?.(' ')?.indexOf?.('play') === -1 || played;
		
	}
	
	setTimeout() {
		
		return new Promise(rs => {
					
					let last;
					
					last = Date.now(), this.elapsed = 0;
					
					const timer = setInterval(() => {
							
							this.paused ? (last = true) :
								last === true ? (last = Date.now()) :
									(this.elapsed += (last - (last = Date.now())) * -1) >= this.value &&
										(clearInterval(timer), rs());
							
						}, 1000 / 60);
					
				});
		
	}
	
	get value() {
		
		return Property.num(this.getAttribute('value'), 0);
		
	}
	set value(v) {
		
		return this.setAttribute('value', v);
		
	}
	get paused() {
		
		return this.hasAttribute('paused');
		
	}
	set paused(v) {
		
		this[v === false ? 'remove' : 'set' + 'Attribute']('paused', v);
		
	}
	
}
class SP extends CustomElement {
	
	static bound = {
		
		play() {
			
			this.composeClosest('app-node')?.addLogs(this.cloneNode(true));
			
		},
		slotted() {
			
			this.slottedContent.closest('compute-node')?.dispatchEvent?.(new CustomEvent('compute'));
			//const	{ slottedContent } = this,
			//		contents = slottedContent.assignedNodes(), l = contents.length;
			//let i, content;
			//
			//i = -1;
			//while (++i < l) {
			//	
			//	if ('spDisabledPack' in (content = contents[i]).dataset  || content instanceof PackNode) continue;
			//	
			//	const packer = document.createElement('pack-node');
			//	
			//	packer.dataset.spDisabledPack = '',
			//	packer.slot = 'content',
			//	packer.append(content.children),
			//	this.appendChild(packer)
			//	content.
			//	
			//}
			//
			//const packer = document.createElement('pack-node');
			//
			//packer.dataset.spDisabledPack = '',
			//packer.slot = 'content',
			//packer.append(...contents),
			//this.appendChild(packer);
			
		}
		
	}
	
	static {
		
		this.tagName = 's-p',
		
		this.shadowElement = {
			
			slottedContent: 'slot[name="content"]'
			
		};
		
	}
	
	constructor() {
		
		super(),
		
		this.addEvent(this.slottedContent, 'slotchange', this.slotted);
		
	}
	
}
class SHandle extends CustomElement {
	
	static bound = {
		
		fulfilled(event) {
			
			this.operate();
			
		}
		
	};
	
	static {
		
		this.tagName = 's-handle';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	operate(type, operation) {
		
		const appNode = this.composeClosest('app-node');
		
		operation ? (this.operation = operation) : (type = this.type);
		
		switch (type ? (this.type = type) : this.type) {
			case 'input':
			appNode.disableConsoles(operation);
			break;
		}
		
	}
	
	async play() {
		
		//const { proxy = this, revoke } = this[Symbol.asyncIterator] || Proxy.revocable(this, ScriptProxyHandler);
		
		this.addEvent(this, 'fulfilled', () => this.toggle, { once: true }),
		
		this.operate();
		
		//for await (const played of proxy);
		
		//revoke();
		
	}
	
	get operation() {
		
		return this.getAttribute('operation');
		
	}
	set operation(v) {
		
		this.setAttribute('operation', v);
		
	}
	get type() {
		
		return this.getAttribute('type');
		
	}
	set type(v) {
		
		this.setAttribute('type', v);
		
	}
	
}
class DisableInput extends CustomElement {
	
	static {
		
		this.tagName = 'disable-input';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	async play() {
		
		this.disable();
		
	}
	async played() {
		
		this.disable(false);
		
	}
	
	disable(disables) {
		
		this.composeClosest('app-node')?.disableConsoles(disables);
		
	}
	
}
class ScriptNode extends SubscriptionNode {
	
	static bound = {};
	
	static acc = {
		
		content(name, oldValue, newValue) {
			
			this.setContent(newValue);
			
		}
		
	};
	
	static subscriptinos = [];
	
	static {
		
		this.tagName = 'script-node';
		
	}
	
	constructor() {
		
		super();
		
		this.setContent();
		
	}
	connectedCallback() {
		
		this.subscribe();
		
	}
	disconnectedCallback() {
		
		this.unsubscribe();
		
	}
	static get observedAttributes() {
		
		return this.__?.observedAttributeNames;
		
	}
	attributeChangedCallback(name, oldValue, newValue) {
		
		this.acc?.[name]?.(name, oldValue, newValue);
		
	}
	
	setContent(selector = this.content) {
		
		const contents = [ ...document.querySelectorAll(selector) ], l = contents.length;
		
		if (!l) return;
		
		const	contentNode = document.createElement('div'),
				assignedNodes = this.q('slot[name="content"]')?.assignedNodes?.();
		let i;
		
		if (assignedNodes) for (const v of assignedNodes) v.remove();
		
		i = -1, contentNode.slot = 'content';
		while (++i < l) contents[i] = contents[i].content.cloneNode(true);
		
		this.append(...contents);
		
	}
	
	play() {
		
		return Promise.resolve();
		
	}
	
	[Symbol.asyncIterator]() {
		
		const	snodes = this.q(`slot[name="${this.__.slotName}"]`)?.assignedNodes?.(), l = snodes?.length ?? 0;
		let i;
		
		i = 0;
		
		return {
			
			next: detail => {
				
				const	snode = l && snodes[i], done = ++i >= l, played = snode?.play?.(detail);
				
				return played?.then?.(value => ({ value, done })) || Promise.resolve({ value: snode, done });
				//return typeof played === 'function' ?
				//	new Promise(rs => played.then(value => rs({ value, done }))) : Promise.resolve({ value: snode, done });
				
			}
			
		}
		
	}
	
	get content() {
		
		return this.getAttribute('content');
		
	}
	set content(v) {
		
		this.setAttribute('content', v);
		
	}
	
}

class DialogNode extends CustomElement {
	
	static {
		
		this.tagName = 'dialog-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	addLogs(logs, placeholder) {
		
		this.logsNode.addLogs(logs, placeholder);
		
	}
	
	get dialog() {
		
		return this.q('slot[name="dialog"]').assignedElements()[0];
		
	}
	
}

class DisplayNode extends CustomElement {
	
	static {
		
		this.tagName = 'display-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	
}

class MeasureBox extends CustomElement {
	
	static bound = {
		
		mutatedChildList() {
			
			this.measure();
			
		},
		resized() {
			
			this.measure();
			
		}
		
	};
	
	static {
		
		this.tagName = 'measure-box',
		
		this.mutatedChildListOption = { childList: true };
		
	}
	
	constructor() {
		
		super(),
		
		this.observeMutation(this.mutatedChildList, this, MeasureBox.mutatedChildListOption),
		
		this.ro = new ResizeObserver(this.resized),
		this.ro.observe(this);
		
	}
	
	connectedCallback() {
		
		this.measure();
		
	}
	
	static get observedAttributes() {
		
		return [ 'min-member', 'max-member', 'min-width', 'max-width', 'min-height', 'max-height' ];
		
	}
	attributeChangedCallback(name, oldValue, newValue) {
		
		switch (name) {
			
			case 'min-member':
			case 'max-member':
			case 'min-width':
			case 'max-width':
			case 'min-height':
			case 'max-height':
			this.measure();
			break;
			
		}
		
	}
	
	measure() {
		
		const	{ children, maxMember, minMember, maxWidth, minWidth, maxHeight, minHeight } = this, l = children.length,
				n = minMember > l ? minMember : maxMember < l ? maxMember : l,
				{ height: h, width: w } = this.getBoundingClientRect(),
				rawMw = w / n,
				mw = rawMw > maxWidth ? maxWidth : rawMw < minWidth ? minWidth : rawMw,
				rawMh = h / n,
				mh = rawMh > maxHeight ? maxHeight : rawMh < minHeight ? minHeight : rawMh;
		let i, mx,my;
		
		this.style.setProperty('--measured-width', mw + 'px'),
		this.style.setProperty('--measured-height', mh + 'px'),
		
		i = -1;hi(mw);
		while (++i < l)	children[i].style.setProperty('--measured-x', mw * i + 'px'),
								children[i].style.setProperty('--measured-y', mh * i + 'px');
		
	}
	
	getValueAttr(name, min, defaultValue) {
		
		return this.hasAttribute(name) ? Property.num(this.hasAttribute(name), min) : defaultValue;
		
	}
	get maxMember() {
		
		return this.getValueAttr('max-member', 0, Infinity);
		
	}
	set maxMember(v) {
		
		this.setAttribute('max-member', v);
		
	}
	get minMember() {
		
		return this.getValueAttr('min-member', 0, 0);
		
	}
	set minMember(v) {
		
		this.setAttribute('min-member', v);
		
	}
	get maxWidth() {
		
		const v = this.getValueAttr('max-width', -Infinity, -1);
		
		return v < 0 ? this.getBoundingClientRect().width : v;
		
	}
	set maxWidth(v) {
		
		this.setAttribute('max-width', v);
		
	}
	get minWidth() {
		
		return this.getValueAttr('min-width', 0, 0);
		
	}
	set minWidth(v) {
		
		this.setAttribute('min-width', v);
		
	}
	get maxHeight() {
		
		const v = this.getValueAttr('max-height', -Infinity, -1);
		
		return v < 0 ? this.getBoundingClientRect().height : v;
		
	}
	set maxHeight(v) {
		
		this.setAttribute('max-height', v);
		
	}
	get minHeight() {
		
		return this.getValueAttr('min-height', 0, 0);
		
	}
	set minHeight(v) {
		
		this.setAttribute('min-height', v);
		
	}
	
}

class SpriteNode extends CustomElement {
	
	static bound = {
		
		resized() {
			
			this.calculate();
			
		},
		
		changedSlot() {
			
			const	assignedElements = this.slotNode.assignedElements(), l = assignedElements.length;
			let i;
			
			i = -1, this.ro.disconnect(), this.isConnected && this.ro.observe(this);
			while (++i < l) this.ro.observe(assignedElements[i]);
			
		}
		
	};
	
	static {
		
		this.tagName = 'sprite-node';
		
	}
	
	constructor() {
		
		super(),
		
		this.ro = new ResizeObserver(this.resized),
		
		(this.slotNode = this.q('slot[name="sprite"]')).addEventListener('slotchange', this.changedSlot);
		
	}
	
	connectedCallback() {
		
		this.calculate(),
		
		this.ro.observe(this);
		
	}
	disconnectedCallback() {
		
		this.ro?.unobserve?.(this);
		
	}
	
	calculate() {
		
		const	assignedElements = this.slotNode.assignedElements(), l = assignedElements.length;
		let i;
		
		// assignedNodes が複数存在する時の値の決定方法がわからないため、現状は機械的に後方の要素の値で既存の値を上書きする。
		
		i = -1;
		while (++i < l) {
			const { height: h, width: w } = assignedElements[i].getBoundingClientRect();
			this.setCSSVar('sprite-size-width', w),
			this.setCSSVar('sprite-size-height', h),
			this.setCSSVar('sprite-aspect-ratio-wh', w / h),
			this.setCSSVar('sprite-aspect-ratio-hw', h / w),
			this.setCSSVar('sprite-horizontal', +(w > h)),
			this.setCSSVar('sprite-vertical', +(w < h));
		}
		
	}
	
}

class CharacterNode extends CustomElement {
	
	static bound = {
		
	};
	
	static {
		
		this.tagName = 'character-node';
		
	}
	
	constructor() {
		
		super();
		
		this.setData();
		
	}
	static get observedAttributes() {
		
		return [ 'data-data' ];
		
	}
	attributeChangedCallback(name, oldValue, newValue) {
		
		switch (name) {
			case 'data-data': newValue === this.dataset.data || this.setData(newValue); break;
		}
		
	}
	
	setData(selector) {
		
		if (selector && selector !== this.dataset.data) {
			
			this.dataset.data = selector;
			return;
			
		}
		
		const dataNode = document.querySelector(selector || this.dataset.data);
		
		if (!(dataNode instanceof HTMLTemplateElement)) return;
		
		const content = dataNode.content.cloneNode(true);
		
		this.loadResources(content), this.appendChild(content);
		
	}
	
	loadResources(content) {
		
		const resources = content.getElementById('resources')?.children, l = resources.length;
		let i, r;
		
		i = -1;
		while (++i < l) {
			
			if (!(r = resources[i]).id) continue;
			
			switch ((r = resources[i]).tagName) {
				case 'IMG':
				r.decode().then((r => () => {
					
					document.documentElement.style.setProperty(`--img-${r.id}-url`, `url("${r.src}")`),
					document.documentElement.style.setProperty(`--img-${r.id}-width-px`, r.width + 'px'),
					document.documentElement.style.setProperty(`--img-${r.id}-width`, r.width),
					document.documentElement.style.setProperty(`--img-${r.id}-height-px`, r.height + 'px'),
					document.documentElement.style.setProperty(`--img-${r.id}-height`, r.height);
					
				})(r));
				break;
			}
			
		}
		
	}
	
	evaluateAll(inputs) {
		
		let i,l,i0, logs, values;
		
		i = -1, l = (Array.isArray(inputs) ? inputs : [ inputs ]).length, values = [];
		while (++i < l) values[i] = this.evaluate(inputs[i]);
		
		i = i0 = -1, l = (values = values.flat(1)).length, logs = [];
		while (++i < l) values[i]?.dialogs && (logs[++i0] = values[i]?.dialogs);
		
		return logs.flat(1);
		
	}
	
	evaluate(input) {
		
		const	conditions = this.querySelectorAll('#conditions > condition-block[data-has~="input"]'),
				l = conditions.length, values = [];
		let i;
		
		i = -1;
		while (++i < l) values[i] = conditions[i].evaluate(input);
		
		return values;
		
	}
	
	get metadata() {
		
		return this.querySelector('#metadata').get();
		
	}
	
}

class MetaData extends CustomElement {
	
	static {
		this.tagName = 'meta-data';
	}
	
	constructor() {
		super();
	}
	
	get() {
		
		const	isArray = !!this.querySelector(':scope > meta-datum:not([data-name])'),
				nodes = this.querySelectorAll(':scope > meta-datum, :scope > meta-data'), l = nodes.length,
				data = isArray ? [] : {};
		let i,i0, node;
		
		i = i0 = -1;
		while (++i < l) data[(node = nodes[i]).dataset?.name ?? ++i0] = node.get();
		
		return data;
		
	}
	
}
class MetaDatum extends CustomElement {
	
	static {
		this.tagName = 'meta-datum';
	}
	
	constructor() {
		super();
	}
	
	get(as = this.dataset.type) {
		
		let v;
		
		switch (as) {
			
			case 'boolean':
			v = this.textContent.trim();
			return v === '0' || v.toLowerCase() === 'false' ? false : !!v;
			
			case 'number': return +this.textContent.trim();
			
			case 'undefined': return undefined;
			
			case 'null': return null;
			
			case 'json':
			try {
				v = JSON.parse(this.textContent.trim());
			} catch(error) {
				v = null, console.error(error);
			}
			return v;
			
			case 'dom':
			(v = document.createDocumentFragment()).append(...this.cloneNode(true).children);
			return v;
			
			case 'text': return this.innerText.trim();
			
			default: return this.textContent.trim();
			
		}
		
	}
	
}

class LogsNode extends CustomElement {
	
	static {
		
		this.tagName = 'logs-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	addLogs(logs, placeholder) {
		
		const logsContainer = document.createElement('logs-container');
		
		logsContainer.addLogs(logs, placeholder),
		
		this.root.prepend(logsContainer);
		
	}
	
}
class LogsContainer extends CustomElement {
	
	static {
		
		this.tagName = 'logs-container';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	addLogs(logs, placeholder) {
		
		const l = (Array.isArray(logs) ? logs : (logs = [ logs ])).length, logNodes = [];
		let i, slotNode;
		
		i = -1;
		while (++i < l) (logNodes[i] = document.createElement('log-node')).setContent(logs[i], placeholder);
		
		this.root.prepend(...logNodes);
		
	}
	
}
class LogNode extends CustomElement {
	
	static replace(node, placeholder) {
		
		if (!placeholder || typeof placeholder !== 'object') return node;
		
		const { children } = node, l = children.length, { replace } = LogNode;
		let i;
		
		if (l) {
			
			i = -1;
			while (++i < l) replace(children[i], placeholder);
			
		} else node.innerText = strings(node.innerText, placeholder)[0];
		
		return node;
		
	}
	
	static {
		
		this.tagName = 'log-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	setContent(content, placeholder) {
		
		const slotNode = this.querySelector('[slot="content"]') || document.createElement('div');
		
		slotNode.slot = 'content',
		slotNode.append(content instanceof Node ? LogNode.replace(content, placeholder) : content),
		this.appendChild(slotNode);
		
	}
	
}

// 入力用のカスタム要素

class ConsolesNode extends CustomElement {
	
	static bound = {};
	
	static {
		
		this.tagName = 'consoles-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	disableConsoles(disables = true) {
		
		const consoleNodes = this.querySelectorAll('console-node'), l = consoleNodes.length;
		let i;
		
		i = -1;
		while (++i < l) consoleNodes[i].disabled = disables;
		
	}
	
}
class ConsoleNode extends CustomElement {
	
	static bound = {
		
		clickedSendButton(event) {
			
			this.emitInput(event);
			
		},
		
		pressedKey(event) {
			
			const { key, type } = event;
			
			event[ConsoleNode.targetNode] = this;
			
			switch (type) {
				
				case 'keypress':
				switch (key) {
					case 'Enter': this.emitInput(event); break;
				}
				break;
				
			}
			
			this.emit('console-' + type, event);
			
		}
		
	};
	
	static {
		
		this.tagName = 'console-node',
		this.targetNode = Symbol('ConsoleNode.targetNode'),
		
		this.element = {},
		
		this.shadowElement = {
			inputForm: '#inputform',
			inputButton: '#send'
		};
		
	}
	
	constructor() {
		
		super();
		
		const { clickedSendButton, inputButton, inputForm, pressedKey } = this;
		
		this.addEvent(inputForm, 'keypress', pressedKey),
		this.addEvent(inputForm, 'keyup', pressedKey),
		this.addEvent(inputForm, 'keydown', pressedKey),
		this.addEvent(inputButton, 'click', clickedSendButton);
		
	}
	connectedCallback() {
		
		
	}
	disconnectedCallback() {
		
		//this.abortEvents();
		
	}
	
	emitInput(event) {
		
		//this.closest('console-node')?.emit('input', targetEvent);
		this.emit('console-input', { event, target: this });
		
	}
	
	get disabled() {
		
		const	components = this.qq('input, button'), l = components.length;
		let i;
		
		i = -1;
		while (++i < l && components[i].hasAttribute('disabled'));
		
		return i === l;
		
	}
	set disabled(v) {
		
		const	components = this.qq('input, button'), l = components.length,
				method = (v ? 'set' : 'remove') + 'Attribute';
		let i;
		
		i = -1;
		while (++i < l) components[i][method]('disabled', '');
		
	}
	get value() {
		
		return this.inputForm.value;
		
	}
	set value(v) {
		
		this.inputForm.value = v;
		
	}
	
}

class BrowserNode extends CustomElement {
	
	static bound = {
		
		clickedTab(event) {
			
			event.target.classList.contains('shown') || this.showTabsExclusive(event.target);
			
		},
		resized(entries) {
			
			this.style.setProperty(
					'--content-height',
					this.root.getBoundingClientRect().height - this.q('browser-tabs').getBoundingClientRect().height + 'px'
				);
			
		},
		shownTab(event) {
			
			event.detail[BrowserNode.tabContent].classList.add('shown');
			
		},
		hiddenTab(event) {
			
			event.detail[BrowserNode.tabContent].classList.remove('shown');
			
		},
		destroyedTab(event) {
			
			event.target[BrowserNode.tabContent].remove();
			
		}
		
	};
	
	static {
		
		this.tabContent = Symbol('BrowserNode.tabContnet'),
		this.constrainedTab = Symbol('BrowserNode.constrainedTab'),
		
		this.tagName = 'browser-node';
		
	}
	
	constructor() {
		
		super();
		
		this.tabsNode = this.q('browser-tabs'),
		
		this.ro = new ResizeObserver(this.resized),
		this.ro.observe(this.q('#view'));
		
	}
	
	setContent(name, content, shows) {
		
		const	tab = new BrowserTab(name),
				contentNode = document.createElement('div');
		
		contentNode.slot = 'view',
		contentNode.classList.add('tab-content'),
		contentNode[BrowserNode.constrainedTab] = tab,
		contentNode.appendChild(content),
		this.appendChild(contentNode),
		
		tab[BrowserNode.tabContent] = contentNode,
		tab.addEventListener('clicked-tab', this.clickedTab),
		tab.addEventListener('shown', this.shownTab),
		tab.addEventListener('hidden', this.hiddenTab),
		tab.addEventListener('destroyed', this.destroyedTab),
		
		this.tabsNode.appendChild(tab),
		
		shows && this.showTabsExclusive(tab);
		
		return tab;
		
	}
	
	showTabsExclusive(...tabs) {
		
		const shownTabs = this.tabsNode.querySelectorAll('browser-tab.shown'), l = shownTabs.length;
		let i;
		
		i = -1;
		while (++i < l) shownTabs[i].classList.remove('shown');
		
		this.showTabs(...tabs);
		
	}
	
	showTabs(...tabs) {
		
		const l = tabs.length;
		let i, t;
		
		i = -1;
		while (++i < l)	typeof (t = tabs[i]) === 'string' && (t = this.q('#browser-tabs').q('#' + t));
								t && (t instanceof BrowserTab ? t : (t = this.setContent('', t))).classList.add('shown');
		
	}
	
}
class BrowserTabs extends CustomElement {
	
	static bound = {
	};
	
	static {
		
		this.tagName = 'browser-tabs';
		
	}
	
	constructor() {
		
		super();
		
	}
	
}
//class BrowserContent extends CustomElement {
//	static {
//	}
//	constructor() {
//		
//		super();
//		
//	}
//}
class BrowserTab extends CustomElement {
	
	static bound = {
		
		clicked(event) {
			
			this.emit('clicked-tab', this);
			
		},
		pressedDelete(event) {
			
			this.destroy();
			
		}
		
	};
	static get observedAttributes() {
		return [ 'class' ];
	}
	
	static {
		
		this.tagName = 'browser-tab';
		
	}
	
	constructor(name) {
		
		super();
		
		this.addEvent(this, 'click', this.clicked),
		this.addEvent(this.deleteNode = this.q('delete-node'), 'pressed-delete', this.pressedDelete),
		
		this.name = name;
		
	}
	attributeChangedCallback(name, oldValue, newValue) {
		
		switch (name) {
			
			case 'class':
			
			const shown = this.classList.contains('shown') && 'shown';
			
			(
				!(oldValue = oldValue && oldValue.split(' ').indexOf('shown')) ||
				(shown ? oldValue === -1 : oldValue !== -1)
			) && this.emit(shown || 'hidden', this);
			
			break;
			
		}
		
	}
	
	get name() {
		
		return this.tabName?.textContent ?? '';
		
	}
	set name(v) {
		
		(
			this.tabName ||
				(
					this.tabName = document.createElement('div'),
					this.tabName.id = 'tab-name',
					this.tabName.slot = 'name',
					this.appendChild(this.tabName)
				)
		).textContent = v;
		
	}
	
}
class Emitter extends CustomElement {
	
	static bound = {
		
		dispatch(event) {
			
			const { type } = this, emissions = type[event.type];
			let v;
			
			for (v of emissions) this.emit(v || 'emit', this);
			
		}
		
	};
	
	static {
		
		this.tagName = 'emit-node';
		
	}
	
	constructor(emission) {
		
		super();
		
		this.type = {},
		
		this.addEmission(emission);
		
	}
	addEmission(emission) {
		
		if (!emission || typeof emission !== 'object') return;
		
		const { type } = this;
		
		let i,l,k, t,t0;
		
		for (k in emission) {
			i = -1, l = (Array.isArray(t = emission[k]) ? t : (t = [ t ])).length;
			while (++i < l)	typeof (t0 = t[i]) === 'string' && (
											(type[t0] || (type[t0] = new Set())).add(k),
											this.addEvent(this, t0, this.dispatch)
										);
		}
		
	}
	removeEmission(emissionName) {
		
		const { type } = this;
		let v, t;
		
		for (v of type) (t = type[v]).has?.(emissionName) && (t.delete(emissionName), t.size || delete type[v]);
		
	}
	
}
class DeleteNode extends Emitter {
	
	static {
		
		this.tagName = 'delete-node',
		
		this.emission = {
			'pressed-delete': [ 'click' ]
		}
		
	}
	
	constructor(emission) {
		
		super(emission || DeleteNode.emission);
		
	}
	
}

defineCustomElements(
	
	AppNode,
	DisplayNode,
	DialogNode,
	SpriteNode,
	LogsNode,
	LogsContainer,
	LogNode,
	ConsolesNode,
	ConsoleNode,
	BrowserNode,
	BrowserTabs,
	BrowserTab,
	DeleteNode,
	
	CharacterNode,
	
	MetaData,
	MetaDatum,
	
	EventListener,
	
	ConditionBlock,
	//ConditionEvaluation,
	ConditionTrue,
	ConditionFalse,
	
	RegExpNode,
	QuerySelector,
	
	MeasureBox,
	
	SNode,
	//SContainer,
	//ScenarioNode,
	//SceneNode,
	
	SP,
	SHandle,
	STimeout,
	DisableInput,
	
	ComputeNode, EventBridge, IndexedBlock, PackNode, PackedNode,
	
	//LogicNode,
	//LogicEqual,
	//LogicLeft,
	//LogicRight,
	
);
