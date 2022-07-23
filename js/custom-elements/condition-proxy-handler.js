import AppProxyHandler from './app-proxy-handler.js';

export default class ConditionProxyHandler {
	
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