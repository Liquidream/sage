
import { SAGE } from "../Manager";

export class Script {
  
  // public constructor() {
  // }


  public initialize(): void {
    // Anything?    
  }

  public wait(seconds: number): Promise<void> {
    return new Promise<void>(res => setTimeout(res, seconds * 1000))
  }

  // Help from @mkantor on TS Discord
  // https://www.typescriptlang.org/play?ssl=14&ssc=2&pln=5&pc=1#code/GYVwdgxgLglg9mABAdwIYygCgM4FMIIAm2AXImCALYBGuATgJRkAKdclMeAPAG5wyEAfIgDeAKESS6uKCDpIwuZIlbtOuXvyGZp2RAF5heKABUYlXHBBZdAGkR4CYYogBUiAIwAGHwwYBuMQBfMTFQSFgEFHQoADE4OgBpXABPAAddbEwmFTYObj4BYXFJSQlS6Vl5ciVctQKtQR1cPUNRctLS8Oh4JARk9Mzs9s7RipbswLGxwjgIKlwwKAA6aUo4HlwAUU2lgBlOKEX6TAByAGtUjJbsU-t+q8yAjtGQ6cRZ+Ysl5dRCQh2iygB2wR0UdDOl0GNzuiAe0Ow2GenSCzxCYlQ2BSkEQ3UiSDo4GGJVKTmwcAANrhlhS4ABzM4AeUguEQIDSUVQiFgFmWfNOyNKqDQGDq+WpdFQEFwmAA2iK4gkBtdEdl7ArMABmBgAXUFkjJlOptIZpxMAAt6KyKTBNoREFyMjAWXzlgKpkKFWL1KspTL5TF4klHjc1dEMFrdWjQoSwJMgA

  public waitSkippable(seconds: number): Promise<void> {
    const timedPromise = new Promise<void>(res => setTimeout(res, seconds * 1000))
    return Promise.race([timedPromise, this.waitForSkip()])
  }

  public safeExecFunc(strFunc: string) {
    try {
      Function(strFunc)();
    }
    catch (e: unknown) {
      if (e instanceof Error) {
        SAGE.Dialog.showErrorMessage(`Error running script function: ${e.message}`);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public safeExecFuncWithParams(strFunc: string, param1?: any, param2?: any): any {
    try {
      return (<any>SAGE.Actions)[strFunc](param1, param2);
    }
    catch (e: unknown) {
      if (e instanceof Error) {
        SAGE.Dialog.showErrorMessage(`Error running script function: ${e.message}`);
      }
    }
  }

  private waitForSkip(): Promise<void> {
    return new Promise<void>(res => {
      function onSkip() {
        res();
        SAGE.Events.removeListener("sceneinteract", onSkip);
        //document.removeEventListener('keypress', onSkip);
      }
      SAGE.Events.on("sceneinteract", onSkip, this);
    });
  }
}