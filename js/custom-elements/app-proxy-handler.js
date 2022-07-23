export default class AppProxyHandler {
	
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