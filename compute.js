import strings from '../strings.js';

export class IndexedBlock extends CustomElement {
	
	static bound = {
		
		emittedIndex() {
			
			this.index();
			
		},
		
		mutated() {
			
			this.index();
			
		}
		
	}
	
	static shuffleIndices(indices) {
		
		const l = indices.length, shuffled = [ ...indices ], { random } = Math;
		let i,i0, idx;
		
		i = -1;
		while (++i < l) idx = shuffled[i], shuffled[i] = shuffled[i0 = l * random() |0], shuffled[i0] = idx;
		
		return shuffled;
		
	}
	static randomizeIndices(indices) {
		
		const l = indices.length, randomized = [ ...indices ], { random } = Math;
		let i;
		
		i = -1;
		while (++i < l) randomized[i] = indices[l * random() |0];
		
		return randomized;
		
	}
	
	// IndexedBlock.index で要素に作成されたプロパティ IndexedBlock.indexed が示す配列中の文字列に一致する
	// node.style のプロパティを削除する。プロパティ名の一致しか確認していないため、不整合は容易に起こせるし起こり得る。
	// node.id か node.dataset.taggedIndexing に一意の値を指定することで不慮の削除は防げるが、
	// 意図的に名前が一致するプロパティを作成したり、機械的に生成する場合などには対応しきれない。
	static removeIndexPropertyAll(node) {
		
		const { indexed } = IndexedBlock, properties = node[indexed], l = properties?.length;
		
		delete node[indexed];
		
		if (!l) return;
		
		const { style } = node;
		let i;
		
		i = -1;
		while (++i < l) style.removeProperty(properties[i]);
		
	}
	
	// CSS 変数を設定するための完全に内部処理用の関数。
	// style に設定された要素のインラインスタイルに、keys を結合して作成される文字列の変数を v を値にして作成する。
	// 変数名は list に指定された配列の末尾に自動的に追加される。この list は、index 処理時に、
	// 前の index 時に作成された CSS 変数を削除するための一時的な記憶領域。
	// suffix が指定されていれば、keys から作られる変数名に加えて、その変数名の末尾に stuffix を付加した同値の CSS を作成する。
	static setCSSVar(style, suffix, v, list, ...keys) {
		
		const l = keys.length;
		let i,k, name;
		
		i = -1, name = '-';
		while (++i < l) (k = keys[i]) && (name += '-' + k);
		
		style.setProperty(list[i = list.length] = name, v),
		suffix === undefined || style.setProperty(list[++i] = name + '-' + suffix, v);
		
	}
	
	// node に指定した要素のすべての子要素に、tag に指定した文字列を含むプロパティ名で CSS 変数を設定する。
	// 値は各要素の node 内および各要素の親要素内での位置を示す整数値。
	// --serial-index-tag は、node を含む、node が含むすべての要素に順に割り振られる、node 内での一意の整数。
	// node の子要素の走査は先頭から始まり、隣の要素に移る前に、その要素の子要素の走査へ移る。
	// tag が未指定だと、node に id が存在していれば id を、存在しなければ depth の値で補われる。
	// depth は node の階層の深さを示す値で、node では 0 を示し、ひとつ階層が深まる度に 1 増加する。
	// tag は原則上位の要素から引き継がれるが、再帰した時に、node.dataset.taggedIndexing が存在していればその値で上書きされる。
	// 上書き後は、その要素の子要素はその上書きされた tag を引き継ぐが、上書きした要素から上位ないし隣り合う要素に移ると上書き前のものに戻る。
	// taggedIndexing は論理値としても使え、値が未指定の場合 node.id で補われる。
	// 他に node.dataset.indixing="disabled" だと、その要素はインデックスでカウントされるが、CSS 変数は設定されない。
	// node.dataset.indixing="none" だと、その要素はインデックスにカウントされず、CSS 変数も設定されない。
	// 第四引数以降に任意の文字列を指定すると、それらの値をインデックスされたすべての要素の属性 class に追加する。
	static index(node, tag, serialIndex = 0, depth = 0) {
		
		const { children: { length }, dataset: { indexing, taggedIndexing }, style } = node;
		
		IndexedBlock.removeIndexPropertyAll(node);
		
		if (indexing === 'none') return serialIndex;
		
		let targets;
		
		if (node instanceof HTMLSlotElement) {
			
			const assignedNodes = node.assignedNodes(), l = assignedNodes.length;
			let i;
			
			i = -1, targets = [];
			while (++i < l) assignedNodes[i].dataset.indexing === 'none' || (targets[i] = assignedNodes[i]);
			
		} else targets = [ ...node.querySelectorAll(':scope > :not([data-indexing="none"])') ];
		
		const	l = targets.length,
				{ index, indexed, setCSSVar, shuffleIndices, randomizeIndices } = IndexedBlock,
				properties = node[indexed] = [],
				prefix = 'index';
		
		indexing === 'disabled' || (
				
				setCSSVar(style, depth, serialIndex++, properties,
					'serial', prefix, tag = (taggedIndexing === undefined ? tag : taggedIndexing || node.id)),
				setCSSVar(style, depth, l, properties, prefix, tag, 'length'),
				setCSSVar(style, depth, depth, properties, prefix, tag, 'depth')
				
			);
		
		if (!l) return serialIndex;
		
		const indices = [];
		let i,i0;
		
		i = -1;
		while (++i < l) indices[i] = i;
		
		const	shuffled = shuffleIndices(indices), randomized = randomizeIndices(indices), hl = (l - 1) / 2 |0,
				{ abs } = Math, { isArray } = Array;
		
		// ここから再帰
		
		i = -1, ++depth;
		while (++i < l) {
			
			const target = targets[i], { dataset: { indexing }, style } = target;
			
			serialIndex = index(target, tag, serialIndex, depth);
			
			const properties = target[indexed];
			
			!isArray(properties) || indexing === 'disabled' || (
					
					setCSSVar(style, depth, i, properties, prefix,
						tag = (taggedIndexing === undefined ? tag : taggedIndexing || node.id)),
					setCSSVar(style, depth, i0 = abs(hl - i), properties, prefix, tag, 'absorbed'),
					setCSSVar(style, depth, hl - i0, properties, prefix, tag, 'radiated'),
					setCSSVar(style, depth, l - i - 1, properties, prefix, tag, 'reversed'),
					setCSSVar(style, depth, shuffled[i], properties, prefix, tag, 'shuffled'),
					setCSSVar(style, depth, randomized[i], properties, prefix, tag, 'randomized')
					
				);
			
		}
		
		return serialIndex;
		
	}
	
	static {
		
		this.tagName = 'indexed-block',
		
		this.indexed = Symbol('IndexedBlock.indexed'),
		
		this.mutatedInit = { subtree: true, childList: true };
		
	}
	
	constructor() {
		
		super();
		
		this.activate();
		
	}
	connectedCallback() {
		
		this.addEventListener('index', this.emittedIndex);
		
	}
	disconnectedCallback() {
		
		this.removeEventListener('index', this.emittedIndex);
		
	}
	
	index() {
		
		IndexedBlock.index(this, undefined, undefined, undefined);
		
	}
	
	activate() {
		
		this.passive || (
				(this.mo ||= new MutationObserver(this.mutated)).observe(this, IndexedBlock.mutatedInit),
				this.index()
			);
		
	}
	
	get passive() {
		
		return this.hasAttribute('passive');
		
	}
	set passive(v) {
		
		this[(v === false ? 'remove' : 'set') + 'Attribute']('passive', v);
		
	}
	
}

// target に指定されたセレクターに一致する要素、それがなければ直後の要素、それがなければ最初の子要素の、
// 属性 type に指定されたイベントをキャプチャし、bridge に指定されたセレクターに一致する要素、それがなければ直前の要素、
// それがなければ親要素に対して、属性 emit に指定されたイベント名でイベントを通知する。emit が未指定であればキャプチャしたイベントのイベント名が使われる。
// 直接関係のない要素間をイベントを通じて関連付ける。target が未指定の時に対象となる要素が EventBridge であれば、他の要素になるまで同方向へ探査する。
export class EventBridge extends CustomElement {
	
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

export class ComputeNode extends CustomElement {
	
	static bound = {
		
		emittedCompute() {
			
			this.compute();
			
		},
		
		mutated() {
			
			this.compute();
			
		}
		
	};
	static acc = {
		
		passive(name, oldValue, newValue) {
			
			newValue ? this.mo.disconnect(this) : this.mo.observe(this, ComputeNode.mutatedInit);
			
		}
		
	};
	
	static setCSSVar(node, name, value, prefix = '', unit = 'px') {
		
		node.style.setProperty(name = '--' + (prefix && (prefix += '-')) + name, value),
		unit === null || unit === false || node.style.setProperty(name + '-unit', value + unit);
		
	}
	static setCSSVarAll(node, object, prefix = '', unit = 'px') {
		
		if (!object || typeof object !== 'object') return;
		
		const { setCSSVar } = ComputeNode;
		let k,v,p,u;
		
		for (k in object) (v = object[k]) && typeof v === 'object' ?
			(k = v.name || k, p = v.prefix || prefix, u = v.unit || unit, v = v.value) : (p = prefix, u = unit),
			setCSSVar(node, k, v, p, u);
		
	}
	
	static compute(node, prefix, computed) {
		
		const	{ compute, getComputed, setCSSVarAll } = ComputeNode,
				{ dataset: { computeClasses }, classList } = node;
		let i, children;
		
		children = node instanceof HTMLSlotElement ? node.assignedNodes() : node.children;
		
		const l = children.length
		
		i = -1;
		while (++i < l) compute(children[i], prefix, computed);
		
		setCSSVarAll(node, getComputed(node), prefix), computed && classList.add(computed);
		
	}
	static getComputed(node) {
		
		const { x, y, width, height } = node.getBoundingClientRect(node),
				{ offsetLeft, offsetTop, offsetWidth, offsetHeight } = node;
		
		return {
			x, y, width, height,
			'offset-left': offsetLeft,
			'offset-top': offsetTop,
			'offset-width': offsetWidth,
			'offset-height': offsetHeight
		};
		
	}
	
	// node と、その子孫要素中の classNames を削除する。
	// 子孫要素中に HTMLSlotElement が存在していれば、その assignedNodes から取得できる要素の classNames も再帰して削除する。
	static removeClassNames(node, ...classNames) {
		
		const	nodes = node.querySelectorAll('.' + classNames.join('.')),
				slots = node.getElementsByTagName('slot'),
				{ removeClassNames } = ComputeNode;
		let i,l,i0,l0, assignedNodes;
		
		i = -1, l = nodes.length, node.classList.remove(...classNames);
		while (++i < l) nodes[i].classList.remove(...classNames);
		
		i = -1, l = slots.length;
		while (++i < l) {
			
			i0 = -1, l0 = (assignedNodes = slots[i].assignedNodes()).length;
			while (++i0 < l0) removeClassNames(assignedNodes[i0], ...classNames);
			
		}
		
	}
	
	static {
		
		this.tagName = 'compute-node',
		
		this.mutatedInit = { subtree: true, childList: true, characterData: true };
		
	}
	
	constructor() {
		
		super(),
		
		this.addEvent(this, 'compute', this.emittedCompute),
		
		(this.ro = new ResizeObserver(this.mutated)).observe(this),
		
		this.passive || (this.mo = new MutationObserver(this.mutated)).observe(this, ComputeNode.mutatedInit);
		
	}
	connectedCallback() {
		
		let ancestor;
		
		this.ro.observe(ancestor = this);
		while ((ancestor = ancestor?.parentElement || ancestor?.getRootNode?.()?.host)) this.ro.observe(ancestor);
		
	}
	disconnectedCallback() {
		
		this.ro.disconnect();
		
	}
	attributeChangedCallback(name, oldValue, newValue) {
		
		this.acc?.[name]?.(name, oldValue, newValue);
		
	}
	
	compute() {
		
		const { classList, dataset: { computeContexts, computed }, mo } = this,
				{ compute, mutatedInit, removeClassNames } = ComputeNode,
				contexts = computeContexts?.split?.(' ') || [];
		let i,l,l0, ctx;
		
		mo?.disconnect?.(this),
		
		removeClassNames(this, computed),
		
		i = -1, (!(l = contexts.length) || contexts.indexOf('') === -1) && (contexts[l++] = ''), l0 = l - 1;
		while (++i < l)	(ctx = contexts[i]) && classList.add(ctx),
								compute(this, 'computed' + (ctx && '-' + ctx), i === l0 && computed),
								ctx && classList.remove(ctx);
		
		mo?.observe?.(this, mutatedInit), this.emit('computed', this);
		
	}
	
	get passive() {
		
		return this.hasAttribute('passive');
		
	}
	set passive(v) {
		
		this[(v === false ? 'remove' : 'set') + 'Attribute']('passive', v);
		
	}
	
}

export class PackNode extends CustomElement {
	
	static bound = {
		
		changedCharacterData() {
			
			const { mo } = this;
			
			mo.disconnect(this),
			
			this.pack(),
			
			mo.observe(this, PackNode.characterDataObserverInit);
			
		}
		
	};
	
	static {
		
		this.tagName = 'pack-node',
		
		this.characterDataObserverInit = { subtree: true, childList: true, characterData: true };
		
	}
	
	constructor() {
		
		super();
		
		(this.mo = new MutationObserver(this.changedCharacterData)).observe(this, PackNode.characterDataObserverInit);
		
	}
	
	connectedCallback() {
		
		this.pack();
		
	}
	
	pack(asis = this.dataset.packAsis) {
		
		const { childNodes, classList } = this, packed = new DocumentFragment();
		let i,l,i0,l0, text, content;
		
		// テキストノードが断片化されている場合、それらを統合する。その上でそれぞれのテキストノード内のテキストに String.prototype.trim を実行し、
		// その結果空のテキストノードになった場合、そのテキストノードを削除する。
		// asis に true を指定すると、この処理をスキップする。
		if (!asis) {
			
			i = -1, l = childNodes.length, this.normalize();
			while (++i < l) (text = childNodes[i]) instanceof Text &&
				(text.textContent = (content = text.textContent.trim()), content || (text.remove(), --i, --l));
			
		}
		
		i = -1, l = childNodes.length;
		while (++i < l) {
			
			if (!((text = childNodes[i]) instanceof Text)) continue;
			
			i0 = -1, l += (l0 = (content = text.textContent).length) - 1;
			while (++i0 < l0) packed.appendChild(document.createElement(PackedNode.tagName)).textContent = content[i0];
			
			this.replaceChild(packed, text);
			
		}
		
		//classList.add('packed'),
		
		this.emit('packed', this);
		
	}
	
}
export class PackedNode extends CustomElement {
	
	static {
		
		this.tagName = 'packed-node';
		
	}
	
	constructor() {
		
		super();
		
	}
	
}