import { Chr, Composer, ParseHelper, Pattern, default as strings, Terms } from './strings.js';

// Parser

export default class Parser extends ParseHelper {
	
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