// target に指定されたセレクターに一致する要素、それがなければ直後の要素、それがなければ最初の子要素の、
// 属性 type に指定されたイベントをキャプチャし、bridge に指定されたセレクターに一致する要素、それがなければ直前の要素、
// それがなければ親要素に対して、属性 emit に指定されたイベント名でイベントを通知する。emit が未指定であればキャプチャしたイベントのイベント名が使われる。
// 直接関係のない要素間をイベントを通じて関連付ける。target が未指定の時に対象となる要素が EventBridge であれば、他の要素になるまで同方向へ探査する。
export default class EventBridge extends CustomElement {
	
	static bound = {
		
		listened(event) {
			
			this.bridge?.emit?.(this.emit || event.type, { bridge: this, event });
			
		}
		
	};
	
	static {
		
		this.tagName = 'event-bridge';
		
	}
	
	constructor() {
		
		super();
		
	}
	connectedCallback() {
		
		this.listen();
		
	}
	disconnectedCallback() {
		
		this.mute();
		
	}
	
	listen() {
		
		const { target } = this;
		
		target &&
			(this.mute(), Reflect.apply(this.addEventListener, ...(this.last = [ target, [ this.type, this.listened ] ])));
		
	}
	mute() {
		
		Array.isArray(this.last) && Reflect.apply(this.removeEventListener, ...this.last);
		
	}
	
	get target() {
		
		let target;
		
		if (this.hasAttribute('target')) target = document.querySelector(this.getAttribute('target'));
		
		else {
			
			target = this;
			while (target && target instanceof EventBridge) target = target.nextElementSibling;
			
			if (!target || target instanceof EventBridge) {
				
				const { children } = this, l = children.length;
				let i;
				
				while (++i < l && (target = children[i]) instanceof EventBridge);
				
			}
			
		}
		
		return target && !(target instanceof EventBridge) ? target : null;
		
	}
	set target(v) {
		
		this[(v === false ? 'remove' : 'set') + 'Attribute']('target', v), this.listen();
		
	}
	get type() {
		
		return this.getAttribute('type');
		
	}
	set type(v) {
		
		this.setAttribute('type', v), this.listen();
		
	}
	get bridge() {
		
		let target;
		
		if (this.hasAttribute('bridge')) target = document.querySelector(this.getAttribute('bridge'));
		
		else {
			
			target = this;
			while (target && target instanceof EventBridge) target = target.previousElementSibling;
			
			if (!target || target instanceof EventBridge) {
				
				target = this;
				while (target && target instanceof EventBridge) target = target.parentElement;
				
			}
			
		}
		
		return target && !(target instanceof EventBridge) ? target : null;
		
	}
	set bridge(v) {
		
		this[(v === false ? 'remove' : 'set') + 'Attribute']('bridge', v);
		
	}
	get emit() {
		
		return this.getAttribute('emit');
		
	}
	set emit(v) {
		
		this.setAttribute('emit', v);
		
	}
	
}