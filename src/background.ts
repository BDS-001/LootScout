import { ExtensionLifecycle } from './background/ExtensionLifecycle';
import { MessageRouter } from './background/MessageRouter';
import { debug } from './utils/debug';

debug.log('Background script initialized');

const extensionLifecycle = new ExtensionLifecycle();
const messageRouter = new MessageRouter();

extensionLifecycle.setupEventListeners();
messageRouter.setupEventListeners();
