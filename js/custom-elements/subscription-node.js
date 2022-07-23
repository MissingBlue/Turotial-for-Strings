// 静的プロパティ subscriptions に指定された記述子が示すイベントハンドラーをインスタンスに登録する。
// ハンドラーは、インスタンスのプロパティ subscriber に記録されるが、継承先ではこのプロパティを意識する必要はない。
// 継承先で実装する必要があるのは subscriptions と、connectedCallback 内での subscribe の実行である。
// このスクリプトのカスタム要素は utils.js の CustomElement を継承し、
// CustomElement では（正確には CustomElement が継承する ExtensionNode では）イベントリスナーの管理を一元化して一括して行なうが、
// それでは不十分だった、一括して、かつ部分的にイベントリスナーを登録、削除したい場合に対応する機能を提供するのがこのカスタム要素の目的。
export default class SubscriptionNode extends CustomElement {
	
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