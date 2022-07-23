export default class IndexedBlock extends CustomElement {
	
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
	// node.id か node.dataset.indexTagged に一意の値を指定することで不慮の削除は防げるが、
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
	
	// element に指定した要素のすべての子要素に、tag に指定した文字列を含むプロパティ名で CSS 変数を設定する。
	// 値は各要素の element 内および各要素の親要素内での位置を示す整数値。
	// --serial-index-tag は、element を含む、element が含むすべての要素に順に割り振られる、element 内での一意の整数。
	// element の子要素の走査は先頭から始まり、隣の要素に移る前に、その要素の子要素の走査へ移る。
	// tag が未指定だと、element に id が存在していれば id を、存在しなければ depth の値で補われる。
	// depth は element の階層の深さを示す値で、element では 0 を示し、ひとつ階層が深まる度に 1 増加する。
	// tag は原則上位の要素から引き継がれるが、再帰した時に、element.dataset.indexTagged が存在していればその値で上書きされる。
	// 上書き後は、その要素の子要素はその上書きされた tag を引き継ぐが、上書きした要素から上位ないし隣り合う要素に移ると上書き前のものに戻る。
	// indexTagged は論理値としても使え、値が未指定の場合 element.id で補われる。
	// 他に element.dataset.indixing="disabled" だと、その要素はインデックスでカウントされるが、CSS 変数は設定されない。
	// element.dataset.indixing="none" だと、その要素はインデックスにカウントされず、CSS 変数も設定されない。
	// element.dataset.indixing="transparent" だと、その要素はそれ自身はインデックスにカウントされず、CSS 変数も設定されないが、
	// 自身に替わってそれが持つすべての子要素を、透過的に transparent が設定された要素と同階層の要素としてインデックスする。
	// この指定がされた要素の子孫要素は、直接の子要素だけでなくすべてボタンの掛違い的にその仮想的な階層でインデックスされ続ける点に留意が必要。
	// 第四引数以降に任意の文字列を指定すると、それらの値をインデックスされたすべての要素の属性 class に追加する。
	// インデックスは、任意で不可設定しない限りすべての子孫要素に対して再帰的に行なわれるが、
	// これは HTMLSlotElement.prototype.assignedNodes から辿れる、異なる DOM に属する要素に対しても同様に行なわれる。
	static index(element, tag, serialIndex = 0, depth = 0) {
		
		const { children: { length }, dataset: { indexing, indexTagged }, style } = element;
		
		IndexedBlock.removeIndexPropertyAll(element);
		
		if (indexing === 'none') return serialIndex;
		
		const { index, indexed, prefix, queryTargets, setCSSVar, shuffleIndices, randomizeIndices } = IndexedBlock;
		let i,l,l0,targets,target;
		
		if (element instanceof HTMLSlotElement) {
			
			const assignedNodes = element.assignedNodes(), l = assignedNodes.length;
			
			i = -1, targets = [];
			while (++i < l) assignedNodes[i].dataset.indexing === 'none' || (targets[i] = assignedNodes[i]);
			
		} else targets = [ ...element.querySelectorAll(queryTargets) ];
		
		i = -1, l = targets.length;
		while (++i < l) (target = targets[i]).dataset.indexing === 'transparent' &&
			(l0 = (target = target.querySelectorAll(queryTargets)).length) && (targets.splice(i--, 1, ...target), l += (l0 - 1));
		
		const properties = element[indexed] = [];
		
		indexing === 'disabled' || indexing === 'transparent' || (
				
				setCSSVar(style, depth, serialIndex++, properties,
					'serial', prefix, tag = (indexTagged === undefined ? tag : indexTagged || element.id)),
				setCSSVar(style, depth, l, properties, prefix, tag, 'length'),
				setCSSVar(style, depth, depth, properties, prefix, tag, 'depth')
				
			);
		
		if (!l) return serialIndex;
		
		const indices = [];
		
		i = -1;
		while (++i < l) indices[i] = i;
		
		const	shuffled = shuffleIndices(indices), randomized = randomizeIndices(indices), hl = (l - 1) / 2 |0,
				{ isArray } = Array, { abs } = Math;
		let i0;
		
		// ここから再帰
		
		i = -1, ++depth;
		while (++i < l) {
			
			const target = targets[i], { dataset: { indexing }, style } = target;
			
			serialIndex = index(target, tag, serialIndex, depth);
			
			const properties = target[indexed];
			
			!isArray(properties) || indexing === 'disabled' || (
					
					setCSSVar(style, depth, i, properties, prefix,
						tag = (indexTagged === undefined ? tag : indexTagged || element.id)),
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
		
		this.prefix = 'index',
		this.queryTargets = ':scope > :not([data-indexing="none"])',
		
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