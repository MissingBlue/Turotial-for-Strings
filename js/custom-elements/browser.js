export default class BrowserNode extends CustomElement {
	
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
export class BrowserTabs extends CustomElement {
	
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
export class BrowserTab extends CustomElement {
	
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