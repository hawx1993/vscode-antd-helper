import { workspace, window, ViewColumn } from 'vscode';

export interface Query {
  path: string;
  label: string;
  detail: string;
  description: string;
}

export class App {
  public WORD_REG: RegExp =
    /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/gi;

  getSeletedText() {
    let editor = window.activeTextEditor;

    if (!editor) {
      return;
    }

    let selection = editor.selection;

    if (selection.isEmpty) {
      let range = editor.document.getWordRangeAtPosition(
        selection.start,
        this.WORD_REG
      );

      return editor.document.getText(range);
    } else {
      return editor.document.getText(selection);
    }
  }
  getWebviewContent(query: any) {
    const config = workspace.getConfiguration('antd-helper');
    const linkUrl = config.get('link-url');
    const path = query?.toLowerCase();
    const iframeSrc = `${linkUrl}/components/${path}`;
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cat Coding</title>
        </head>
        <body>
          <iframe style="position: absolute;border: none;left: 0;top: 0;width: 100%;height: 100%;" src="${iframeSrc}"></iframe>
        </body>
        </html>`;
  }

  openHtml(query: any, title: string) {
    const panel = window.createWebviewPanel(query, title, ViewColumn.Two, {
      enableScripts: true, // 启用JS，默认禁用
      retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
    });

    // And set its HTML content
    panel.webview.html = this.getWebviewContent(query);
  }
  openDocs(query: any, title = 'antd-helper') {
    this.openHtml(query, title);
  }
}
