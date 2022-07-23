import { Property } from '../game.js';

export default class STimeout extends CustomElement {
	
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