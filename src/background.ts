import { ExtensionLifecycle } from './background/extensionLifecycle';
import { MessageRouter } from './background/messageRouter';

console.log('Hello from the background!');

const extensionLifecycle = new ExtensionLifecycle();
const messageRouter = new MessageRouter();

extensionLifecycle.setupEventListeners();
messageRouter.setupEventListeners();
