import { ExtensionLifecycle } from './background/ExtensionLifecycle';
import { MessageRouter } from './background/MessageRouter';

console.log('Hello from the background!');

const extensionLifecycle = new ExtensionLifecycle();
const messageRouter = new MessageRouter();

extensionLifecycle.setupEventListeners();
messageRouter.setupEventListeners();
