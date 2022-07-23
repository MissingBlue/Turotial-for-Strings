import strings from './strings.js';

import { Property, default as Game, Instance } from './game.js';

import AppNode from './custom-elements/app-node.js';
//import AppProxyHandler from './custom-elements/app-proxy-handler.js';
import { default as BrowserNode, BrowserTabs, BrowserTab } from './custom-elements/browser.js';
import CharacterNode from './custom-elements/character-node.js';
import ComputeNode from './custom-elements/compute-node.js';
import ConditionBlock from './custom-elements/condition-block.js';
import ConditionExecution from './custom-elements/condition-execution.js';
import ConditionFalse from './custom-elements/condition-false.js';
//import ConditionProxyHandler './custom-elements/condition-proxy-handler.js';
import ConditionTrue from './custom-elements/condition-true.js';
import { ConsolesNode, default as ConsoleNode } from './custom-elements/console-node.js';
import DialogNode from './custom-elements/dialog-node.js';
import DisableInput from './custom-elements/disable-input.js';
import DisplayNode from './custom-elements/display-node.js';
import { default as Emitter, DeleteNode } from './custom-elements/emitter.js';
import EventBridge from './custom-elements/event-bridge.js';
import EventListener from './custom-elements/event-listener.js';
import IndexedBlock from './custom-elements/indexed-block.js';
import { LogsNode, LogsContainer, default as LogNode } from './custom-elements/log-node.js';
import MeasureBox from './custom-elements/measure-box.js';
import MetaData from './custom-elements/meta-data.js';
import MetaDatum from './custom-elements/meta-datum.js';
import PackedNode from './custom-elements/packed-node.js';
import PackNode from './custom-elements/pack-node.js';
import QuerySelector from './custom-elements/query-selector.js';
import RegExpNode from './custom-elements/reg-exp.js';
import ScriptNode from './custom-elements/script-node.js';
//import ScriptProxyHandler from './custom-elements/script-proxy-handler.js';
import SHandle from './custom-elements/s-handle.js';
import SNode from './custom-elements/s-node.js';
import SP from './custom-elements/s-p.js';
import SpriteNode from './custom-elements/sprite-node.js';
import STimeout from './custom-elements/s-timeout.js';
import SubscriptionNode from './custom-elements/subscription-node.js';

document.getElementById('console-node').content.querySelector('input').value =
	'hi';

ConditionBlock.ban(ConditionExecution.tagName),
ConditionBlock.ban(ConditionTrue.tagName),
ConditionBlock.ban(ConditionFalse.tagName),

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