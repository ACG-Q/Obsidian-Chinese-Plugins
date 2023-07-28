"use strict";
var t = require("obsidian");
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function e(t, e, i, n) {
  return new (i || (i = Promise))(function (o, a) {
    function l(t) {
      try {
        r(n.next(t));
      } catch (t) {
        a(t);
      }
    }
    function s(t) {
      try {
        r(n.throw(t));
      } catch (t) {
        a(t);
      }
    }
    function r(t) {
      var e;
      t.done
        ? o(t.value)
        : ((e = t.value),
          e instanceof i
            ? e
            : new i(function (t) {
                t(e);
              })).then(l, s);
    }
    r((n = n.apply(t, e || [])).next());
  });
}
const i = {
  mySetting: "default",
  contextMenu: !0,
  finalLinkFormat: "not-change",
  keepMtime: !1,
};
class n extends t.PluginSettingTab {
  constructor(t, e) {
    super(t, e), (this.plugin = e);
  }
  display() {
    let { containerEl: e } = this;
    e.empty(),
      e.createEl("h2", { text: "Obsidian Link Converter" }),
      new t.Setting(e)
        .setName("文件上下文菜单")
        .setDesc("如果不想在文件上下文菜单中显示单个文件命令，请关闭此选项")
        .addToggle((t) => {
          t.setValue(this.plugin.settings.contextMenu).onChange((t) => {
            (this.plugin.settings.contextMenu = t),
              this.plugin.saveSettings(),
              t
                ? this.plugin.app.workspace.on(
                    "file-menu",
                    this.plugin.addFileMenuItems
                  )
                : this.plugin.app.workspace.off(
                    "file-menu",
                    this.plugin.addFileMenuItems
                  );
          });
        }),
      new t.Setting(e)
        .setName("转换链接格式")
        .setDesc(
          "选择转换后的链接的最终格式。插件将尽可能使用选择的格式进行转换"
        )
        .addDropdown((t) => {
          t.addOption("not-change", "不做更改")
            .addOption("relative-path", "基于当前笔记的相对路径")
            .addOption("absolute-path", "基于仓库根目录的绝对路径")
            .addOption("shortest-path", "尽可能简短的形式")
            .setValue(this.plugin.settings.finalLinkFormat)
            .onChange((t) => {
              (this.plugin.settings.finalLinkFormat = t),
                this.plugin.saveSettings();
            });
        }),
      new t.Setting(e)
        .setName("保留mTime(上次修改时间)")
        .setDesc(
          "如果希望插件在链接转换过程中保持文件的 mtime 不变，请打开此选项"
        )
        .addToggle((t) =>
          t.setValue(this.plugin.settings.keepMtime).onChange((t) => {
            (this.plugin.settings.keepMtime = t), this.plugin.saveSettings();
          })
        );
    const i = e.createDiv("coffee");
    i.addClass("oz-coffee-div");
    i.createEl("a", { href: "https://ko-fi.com/L3L356V6Q" }).createEl("img", {
      attr: { src: "https://cdn.ko-fi.com/cdn/kofi2.png?v=3" },
    }).height = 45;
  }
}
const o = (t, i) =>
    e(void 0, void 0, void 0, function* () {
      const e = [];
      let n = yield i.app.vault.read(t),
        o = n.match(/\[\[.*?\]\]/g);
      if (o) {
        let i = /(?<=\[\[).*?(?=(\]|\|))/,
          n = /(?<=\|).*(?=]])/;
        for (let a of o) {
          if (w(a)) {
            let i = y(a),
              n = A(a);
            if ("" !== i && "" !== n) {
              let o = {
                type: "wikiTransclusion",
                match: a,
                linkText: i,
                altOrBlockRef: n,
                sourceFilePath: t.path,
              };
              e.push(o);
              continue;
            }
          }
          let o = a.match(i);
          if (o) {
            if (o[0].startsWith("http")) continue;
            let i = a.match(n),
              l = {
                type: "wiki",
                match: a,
                linkText: o[0],
                altOrBlockRef: i ? i[0] : "",
                sourceFilePath: t.path,
              };
            e.push(l);
          }
        }
      }
      let a = n.match(/\[(^$|.*?)\]\((.*?)\)/g);
      if (a) {
        let i = /(?<=\().*(?=\))/,
          n = /(?<=\[)(^$|.*?)(?=\])/;
        for (let o of a) {
          if (M(o)) {
            let i = y(o),
              n = A(o);
            if ("" !== i && "" !== n) {
              let a = {
                type: "mdTransclusion",
                match: o,
                linkText: i,
                altOrBlockRef: n,
                sourceFilePath: t.path,
              };
              e.push(a);
              continue;
            }
          }
          let a = o.match(i);
          if (a) {
            if (a[0].startsWith("http")) continue;
            let i = o.match(n),
              l = {
                type: "markdown",
                match: o,
                linkText: a[0],
                altOrBlockRef: i ? i[0] : "",
                sourceFilePath: t.path,
              };
            e.push(l);
          }
        }
      }
      return e;
    }),
  a = (i, n, o) =>
    e(void 0, void 0, void 0, function* () {
      let e = yield n.app.vault.read(i),
        a = "markdown" === o ? yield c(e, i, n) : yield h(e, i, n),
        l = n.settings.keepMtime
          ? yield n.app.vault.adapter.stat(t.normalizePath(i.path))
          : {};
      yield n.app.vault.modify(i, a, l);
    }),
  l = (i, n) =>
    e(void 0, void 0, void 0, function* () {
      let e = i.app.workspace.getActiveFile();
      "md" === e.extension
        ? yield a(e, i, n)
        : new t.Notice("活动文件不是Markdown文件");
    }),
  s = (i, n, o) =>
    e(void 0, void 0, void 0, function* () {
      let e = ((e, i) => {
          var n = [];
          return (
            (function e(i, o) {
              var a = o.vault.getAbstractFileByPath(i);
              if (a instanceof t.TFolder && a.children)
                for (let i of a.children)
                  i instanceof t.TFile && "md" === i.extension && n.push(i),
                    i instanceof t.TFolder && e(i.path, o);
            })(e, i.app),
            n
          );
        })(i.path, n),
        l = new t.Notice("开始链接转换", 0);
      try {
        let t = e.length,
          i = 0;
        for (let s of e)
          i++,
            l.setMessage(`转换笔记中的链接 ${i}/${t}.`),
            d(n.app, s.path, "excalidraw-plugin") ||
              d(n.app, s.path, "kanban-plugin") ||
              (yield a(s, n, o));
      } catch (t) {
        console.log(t);
      } finally {
        l.hide();
      }
    }),
  r = (i, n) =>
    e(void 0, void 0, void 0, function* () {
      let e = n.app.workspace.getActiveViewOfType(t.MarkdownView);
      if (e) {
        let o = e.editor,
          a = o.getSelection(),
          l = e.file;
        if ("" !== a) {
          let t;
          "markdown" === i
            ? (t = yield c(a, l, n))
            : "wiki" === i && (t = yield h(a, l, n)),
            o.replaceSelection(t);
        } else new t.Notice("你没有选择任何文本.");
      } else new t.Notice("There is no active leaf open.", 3e3);
    }),
  C = (t, i) =>
    e(void 0, void 0, void 0, function* () {
      s(t.app.vault.getRoot(), t, i);
    }),
  d = (t, e, i) => {
    let n = t.metadataCache.getCache(e);
    return n.frontmatter && n.frontmatter[i];
  },
  c = (t, i, n) =>
    e(void 0, void 0, void 0, function* () {
      let e = t,
        a = yield o(i, n),
        l = a.filter((t) => "wiki" === t.type);
      for (let t of l) {
        let o = p("markdown", t.linkText, t.altOrBlockRef, i, n);
        e = e.replace(t.match, o);
      }
      let s = a.filter((t) => "wikiTransclusion" === t.type);
      for (let t of s) {
        let o = p("mdTransclusion", t.linkText, t.altOrBlockRef, i, n);
        e = e.replace(t.match, o);
      }
      return e;
    }),
  h = (t, i, n) =>
    e(void 0, void 0, void 0, function* () {
      let e = t,
        a = yield o(i, n),
        l = a.filter((t) => "markdown" === t.type);
      for (let t of l) {
        let o = p("wiki", t.linkText, t.altOrBlockRef, i, n);
        e = e.replace(t.match, o);
      }
      let s = a.filter((t) => "mdTransclusion" === t.type);
      for (let t of s) {
        let o = p("wikiTransclusion", t.linkText, t.altOrBlockRef, i, n);
        e = e.replace(t.match, o);
      }
      return e;
    }),
  L = (t, e, i, n) => {
    let o;
    if ("absolute-path" === n) o = t.path;
    else if ("relative-path" === n)
      o = (function (t, e) {
        function i(t) {
          let e = 0;
          for (; e < t.length && "" === t[e]; e++);
          for (var i = t.length - 1; i >= 0 && "" === t[i]; i--);
          return e > i ? [] : t.slice(e, i - e + 1);
        }
        for (
          var n = i(t.split("/")),
            o = i(e.split("/")),
            a = Math.min(n.length, o.length),
            l = a,
            s = 0;
          s < a;
          s++
        )
          if (n[s] !== o[s]) {
            l = s;
            break;
          }
        var r = [];
        for (s = l; s < n.length - 1; s++) r.push("..");
        return (r = r.concat(o.slice(l))).join("/");
      })(e.path, t.path);
    else if ("shortest-path" === n) {
      o =
        i.app.vault.getFiles().filter((e) => e.name === t.name).length > 1
          ? t.path
          : t.name;
    }
    return o.endsWith(".md") && (o = o.replace(".md", "")), o;
  },
  p = (t, e, i, n, o) => {
    let a,
      l = e,
      s = decodeURI(l),
      r = o.app.metadataCache.getFirstLinkpathDest(s, n.path);
    r &&
      "not-change" !== o.settings.finalLinkFormat &&
      (l = L(r, n, o, o.settings.finalLinkFormat));
    const C = r && "md" === r.extension ? `.${r.extension}` : "";
    if ("wiki" === t)
      return (
        (a =
          "" !== i && i !== decodeURI(l)
            ? r && decodeURI(i) === r.basename
              ? ""
              : "|" + i
            : ""),
        `[[${decodeURI(l)}${a}]]`
      );
    if ("markdown" === t)
      return (
        (a = "" !== i ? i : r ? r.basename : l), `[${a}](${encodeURI(l)}${C})`
      );
    if ("wikiTransclusion" === t) return `[[${decodeURI(l)}#${decodeURI(i)}]]`;
    if ("mdTransclusion" === t) {
      let t = i;
      return (
        i.startsWith("^")
          ? ((t = encodeURI(t.slice(1))), (t = `^${t}`))
          : (t = encodeURI(t)),
        `[](${encodeURI(l)}${C}#${t})`
      );
    }
    return "";
  };
const u = /\[\[(.*?)#.*?\]\]/,
  k = /(?<=\[\[)(.*)(?=#)/,
  f = /(?<=#).*?(?=]])/,
  m = /\[.*?]\((.*?)#.*?\)/,
  g = /(?<=\]\()(.*)(?=#)/,
  v = /(?<=#).*?(?=\))/,
  w = (t) => u.test(t),
  M = (t) => m.test(t),
  y = (t) => {
    let e = u.test(t),
      i = m.test(t);
    if (e || i) {
      let i = t.match(e ? k : g);
      if (i) return i[0];
    }
    return "";
  },
  A = (t) => {
    let e = u.test(t),
      i = m.test(t);
    if (e || i) {
      let i = t.match(e ? f : v);
      if (i) return i[0];
    }
    return "";
  };
class x extends t.Modal {
  constructor(t, e, i) {
    super(t), (this.message = e), (this.callback = i);
  }
  onOpen() {
    let { contentEl: t } = this,
      e = t.createEl("div");
    e.addClass("oz-modal-center"),
      (e.innerHTML = `\n            <div class="oz-modal-title">\n                <h2>Link Converter Plugin</h2>\n            </div>\n            <p>${this.message}</p>\n        `),
      t.createEl("button", { text: "继续" }).addEventListener("click", () => {
        this.callback(), this.close();
      });
    const i = t.createEl("button", { text: "取消" });
    (i.style.cssText = "float: right;"),
      i.addEventListener("click", () => this.close());
  }
}
class F extends t.FuzzySuggestModal {
  constructor(t, e) {
    super(t.app), (this.plugin = t), (this.finalFormat = e);
  }
  getItemText(t) {
    return t.path;
  }
  getItems() {
    return (function (e) {
      let i = [],
        n = e.vault.getRoot();
      function o(e) {
        for (let n of e.children)
          if (n instanceof t.TFolder) {
            let t = n;
            i.push(t), t.children && o(t);
          }
      }
      return i.push(n), o(n), i;
    })(this.app);
  }
  onChooseItem(t, e) {
    let i = `你确定要转换所有 \n            ${
      "wiki" === this.finalFormat
        ? "MDLinks 转换成 WikiLinks"
        : "WikiLinks 转换成 MDLinks"
    } \n            under ${t.name}?`;
    new x(this.app, i, () => s(t, this.plugin, this.finalFormat)).open();
  }
}
class T extends t.Plugin {
  constructor() {
    super(...arguments),
      (this.addFileMenuItems = (i, n) => {
        if (n instanceof t.TFile && "md" === n.extension) {
          if (
            (i.addSeparator(),
            i.addItem((t) => {
              t.setTitle("MDLinks 转换成 WikiLinks")
                .setIcon("bracketIcon")
                .onClick(() => a(n, this, "wiki"));
            }),
            i.addItem((t) => {
              t.setTitle("WikiLinks 转换成 MDLinks")
                .setIcon("markdownIcon")
                .onClick(() => a(n, this, "markdown"));
            }),
            "not-change" !== this.settings.finalLinkFormat)
          ) {
            let a = this.settings.finalLinkFormat;
            i.addItem((i) => {
              i.setTitle(
                "所有Links转换成 " +
                  ("absolute-path" === a
                    ? "基于仓库根目录的绝对路径"
                    : "shortest-path" === a
                    ? "尽可能简短的形式"
                    : "基于当前笔记的相对路径")
              )
                .setIcon("linkEditIcon")
                .onClick(() =>
                  ((i, n, a) =>
                    e(void 0, void 0, void 0, function* () {
                      let e = yield n.app.vault.read(i),
                        l = yield o(i, n);
                      for (let t of l) {
                        let o = decodeURI(t.linkText),
                          l = n.app.metadataCache.getFirstLinkpathDest(
                            o,
                            t.sourceFilePath
                          );
                        l &&
                          ((o = L(l, i, n, a)),
                          (e = e.replace(
                            t.match,
                            p(t.type, o, t.altOrBlockRef, i, n)
                          )));
                      }
                      let s = n.settings.keepMtime
                        ? yield n.app.vault.adapter.stat(
                            t.normalizePath(i.path)
                          )
                        : {};
                      yield n.app.vault.modify(i, e, s);
                    }))(n, this, a)
                );
            });
          }
          i.addSeparator();
        }
      });
  }
  onload() {
    return e(this, void 0, void 0, function* () {
      console.log("Link Converter Loading..."),
        t.addIcon(
          "bracketIcon",
          '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" stroke="currentColor" viewBox="0 0 100 100"><path d="M 23.136719 15 C 21.878052 15 20.700995 15.32749 19.701172 15.982422 C 18.652109 16.670476 18 17.795519 18 19.015625 L 18 80.984375 C 18 82.205152 18.653942 83.330703 19.703125 84.017578 C 20.702582 84.673028 21.877834 85 23.136719 85 L 37.984375 85 C 39.194314 85 40.315244 84.374611 41.007812 83.353516 C 41.665298 82.38469 42 81.244557 42 80.035156 C 42 78.719909 41.655993 77.51284 40.953125 76.525391 A 1.0001 1.0001 0 0 0 40.951172 76.523438 C 40.215227 75.496161 39.079167 75 37.984375 75 L 29 75 L 29 25 L 37.984375 25 C 39.078394 25 40.217015 24.505328 40.953125 23.476562 A 1.0001 1.0001 0 0 0 40.953125 23.474609 C 41.656201 22.488141 42 21.2818 42 19.964844 C 42 18.753998 41.666698 17.614289 41.009766 16.644531 A 1.0001 1.0001 0 0 0 41.007812 16.642578 C 40.314352 15.623284 39.192361 15 37.982422 15 L 23.136719 15 z M 62.015625 15 C 60.805686 15 59.684756 15.625389 58.992188 16.646484 C 58.334648 17.615934 58 18.754828 58 19.964844 C 58 21.280946 58.343571 22.487775 59.046875 23.474609 A 1.0001 1.0001 0 0 0 59.046875 23.476562 C 59.782985 24.505281 60.921606 25 62.015625 25 L 71 25 L 71 75 L 62.015625 75 C 60.920833 75 59.78482 75.496115 59.048828 76.523438 A 1.0001 1.0001 0 0 0 59.046875 76.525391 C 58.344281 77.512474 58 78.719054 58 80.035156 C 58 81.246002 58.33346 82.386577 58.990234 83.355469 A 1.0001 1.0001 0 0 0 58.990234 83.357422 C 59.683742 84.376716 60.805686 85 62.015625 85 L 76.863281 85 C 78.121319 85 79.29711 84.673229 80.296875 84.017578 C 81.345752 83.330904 82.001331 82.205786 82 80.984375 L 82 19.017578 C 82 17.796746 81.345631 16.670275 80.296875 15.982422 C 79.297095 15.326316 78.120842 15 76.861328 15 L 62.015625 15 z M 23.136719 17 L 37.982422 17 C 38.608483 17 38.953023 17.17892 39.353516 17.767578 C 39.788583 18.40982 40 19.105689 40 19.964844 C 40 20.947133 39.766479 21.691303 39.324219 22.3125 C 39.324219 22.3125 39.324219 22.314453 39.324219 22.314453 C 38.909471 22.892973 38.613258 23 37.984375 23 L 28 23 A 1.0001 1.0001 0 0 0 27 24 L 27 76 A 1.0001 1.0001 0 0 0 28 77 L 37.984375 77 C 38.612858 77 38.908965 77.108583 39.324219 77.6875 C 39.766688 78.309763 40 79.055157 40 80.035156 C 40 80.893141 39.787366 81.591613 39.353516 82.230469 A 1.0001 1.0001 0 0 0 39.353516 82.232422 C 38.954084 82.82128 38.610436 83 37.984375 83 L 23.136719 83 C 22.210233 83 21.463048 82.781597 20.798828 82.345703 A 1.0001 1.0001 0 0 0 20.796875 82.34375 C 20.178105 81.938672 20 81.601598 20 80.984375 L 20 19.015625 C 20 18.399731 20.179891 18.060243 20.798828 17.654297 C 21.463005 17.219229 22.211385 17 23.136719 17 z M 62.015625 17 L 76.861328 17 C 77.787814 17 78.536952 17.218403 79.201172 17.654297 C 79.820416 18.060444 80 18.40241 80 19.017578 L 80 80.984375 A 1.0001 1.0001 0 0 0 80 80.986328 C 80.000669 81.600917 79.822248 81.938425 79.203125 82.34375 A 1.0001 1.0001 0 0 0 79.201172 82.345703 C 78.537306 82.781302 77.788615 83 76.863281 83 L 62.015625 83 C 61.390243 83 61.046422 82.819556 60.646484 82.232422 C 60.213258 81.593314 60 80.894311 60 80.035156 C 60 79.054012 60.233086 78.310079 60.675781 77.6875 C 60.675781 77.6875 60.675781 77.685547 60.675781 77.685547 C 61.09065 77.107578 61.387514 77 62.015625 77 L 72 77 A 1.0001 1.0001 0 0 0 73 76 L 73 24 A 1.0001 1.0001 0 0 0 72 23 L 62.015625 23 C 61.386742 23 61.090529 22.89302 60.675781 22.314453 L 60.675781 22.3125 C 60.233747 21.691666 60 20.945988 60 19.964844 C 60 19.106859 60.212024 18.408128 60.646484 17.767578 C 61.045916 17.178673 61.389564 17 62.015625 17 z M 23.492188 22.992188 A 0.50005 0.50005 0 0 0 23 23.5 L 23 24.5 A 0.50005 0.50005 0 1 0 24 24.5 L 24 23.5 A 0.50005 0.50005 0 0 0 23.492188 22.992188 z M 76.492188 22.992188 A 0.50005 0.50005 0 0 0 76 23.5 L 76 24.5 A 0.50005 0.50005 0 1 0 77 24.5 L 77 23.5 A 0.50005 0.50005 0 0 0 76.492188 22.992188 z M 23.492188 26.992188 A 0.50005 0.50005 0 0 0 23 27.5 L 23 31.5 A 0.50005 0.50005 0 1 0 24 31.5 L 24 27.5 A 0.50005 0.50005 0 0 0 23.492188 26.992188 z M 76.492188 26.992188 A 0.50005 0.50005 0 0 0 76 27.5 L 76 31.5 A 0.50005 0.50005 0 1 0 77 31.5 L 77 27.5 A 0.50005 0.50005 0 0 0 76.492188 26.992188 z M 23.492188 33.992188 A 0.50005 0.50005 0 0 0 23 34.5 L 23 76.5 A 0.50005 0.50005 0 1 0 24 76.5 L 24 34.5 A 0.50005 0.50005 0 0 0 23.492188 33.992188 z M 76.492188 33.992188 A 0.50005 0.50005 0 0 0 76 34.5 L 76 76.5 A 0.50005 0.50005 0 1 0 77 76.5 L 77 34.5 A 0.50005 0.50005 0 0 0 76.492188 33.992188 z"/></svg>'
        ),
        t.addIcon(
          "markdownIcon",
          '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" stroke="currentColor" viewBox="0 0 64 64"><path d="M 5 8 C 3.347656 8 2 9.347656 2 11 L 2 53 C 2 54.652344 3.347656 56 5 56 L 59 56 C 60.652344 56 62 54.652344 62 53 L 62 11 C 62 9.347656 60.652344 8 59 8 Z M 5 10 L 59 10 C 59.550781 10 60 10.449219 60 11 L 60 53 C 60 53.550781 59.550781 54 59 54 L 5 54 C 4.449219 54 4 53.550781 4 53 L 4 11 C 4 10.449219 4.449219 10 5 10 Z M 45 20 C 44.449219 20 44 20.445313 44 21 L 44 36.585938 L 41.707031 34.292969 C 41.316406 33.902344 40.683594 33.902344 40.292969 34.292969 C 39.902344 34.683594 39.902344 35.316406 40.292969 35.707031 L 44.292969 39.703125 C 44.386719 39.796875 44.496094 39.871094 44.617188 39.921875 C 44.738281 39.972656 44.871094 40 45 40 C 45.128906 40 45.261719 39.972656 45.382813 39.921875 C 45.503906 39.871094 45.613281 39.796875 45.707031 39.703125 L 49.707031 35.707031 C 50.097656 35.316406 50.097656 34.683594 49.707031 34.292969 C 49.316406 33.902344 48.683594 33.902344 48.292969 34.292969 L 46 36.585938 L 46 21 C 46 20.445313 45.550781 20 45 20 Z M 16.109375 20.003906 C 16.003906 19.996094 15.898438 20 15.792969 20.019531 C 15.371094 20.113281 15.054688 20.460938 15.003906 20.890625 L 13.003906 38.890625 C 12.945313 39.4375 13.339844 39.929688 13.890625 39.992188 C 14.4375 40.046875 14.929688 39.660156 14.992188 39.109375 L 16.660156 24.113281 L 22.136719 33.503906 C 22.496094 34.117188 23.503906 34.117188 23.863281 33.503906 L 29.339844 24.113281 L 31.007813 39.109375 C 31.0625 39.621094 31.496094 40 32 40 C 32.035156 40 32.074219 40 32.109375 39.996094 C 32.660156 39.933594 33.054688 39.4375 32.996094 38.890625 L 30.996094 20.890625 C 30.945313 20.460938 30.628906 20.113281 30.207031 20.019531 C 29.785156 19.929688 29.355469 20.125 29.136719 20.496094 L 23 31.015625 L 16.863281 20.496094 C 16.699219 20.21875 16.417969 20.039063 16.109375 20.003906 Z M 7 48 C 6.449219 48 6 48.445313 6 49 L 6 51 C 6 51.554688 6.449219 52 7 52 C 7.550781 52 8 51.554688 8 51 L 8 49 C 8 48.445313 7.550781 48 7 48 Z M 12 48 C 11.449219 48 11 48.445313 11 49 L 11 51 C 11 51.554688 11.449219 52 12 52 C 12.550781 52 13 51.554688 13 51 L 13 49 C 13 48.445313 12.550781 48 12 48 Z M 17 48 C 16.449219 48 16 48.445313 16 49 L 16 51 C 16 51.554688 16.449219 52 17 52 C 17.550781 52 18 51.554688 18 51 L 18 49 C 18 48.445313 17.550781 48 17 48 Z M 22 48 C 21.449219 48 21 48.445313 21 49 L 21 51 C 21 51.554688 21.449219 52 22 52 C 22.550781 52 23 51.554688 23 51 L 23 49 C 23 48.445313 22.550781 48 22 48 Z M 27 48 C 26.449219 48 26 48.445313 26 49 L 26 51 C 26 51.554688 26.449219 52 27 52 C 27.550781 52 28 51.554688 28 51 L 28 49 C 28 48.445313 27.550781 48 27 48 Z M 32 48 C 31.449219 48 31 48.445313 31 49 L 31 51 C 31 51.554688 31.449219 52 32 52 C 32.550781 52 33 51.554688 33 51 L 33 49 C 33 48.445313 32.550781 48 32 48 Z M 37 48 C 36.449219 48 36 48.445313 36 49 L 36 51 C 36 51.554688 36.449219 52 37 52 C 37.550781 52 38 51.554688 38 51 L 38 49 C 38 48.445313 37.550781 48 37 48 Z M 42 48 C 41.449219 48 41 48.445313 41 49 L 41 51 C 41 51.554688 41.449219 52 42 52 C 42.550781 52 43 51.554688 43 51 L 43 49 C 43 48.445313 42.550781 48 42 48 Z M 47 48 C 46.449219 48 46 48.445313 46 49 L 46 51 C 46 51.554688 46.449219 52 47 52 C 47.550781 52 48 51.554688 48 51 L 48 49 C 48 48.445313 47.550781 48 47 48 Z M 52 48 C 51.449219 48 51 48.445313 51 49 L 51 51 C 51 51.554688 51.449219 52 52 52 C 52.550781 52 53 51.554688 53 51 L 53 49 C 53 48.445313 52.550781 48 52 48 Z M 57 48 C 56.449219 48 56 48.445313 56 49 L 56 51 C 56 51.554688 56.449219 52 57 52 C 57.550781 52 58 51.554688 58 51 L 58 49 C 58 48.445313 57.550781 48 57 48 Z"/></svg>'
        ),
        t.addIcon(
          "linkEditIcon",
          '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" stroke="currentColor" viewBox="0 0 64 64"> <path d="M 44.140625 3.453125 C 41.323125 3.453125 38.504375 4.5249219 36.359375 6.6699219 L 30.710938 12.320312 C 27.160937 15.870312 26.550859 21.270937 28.880859 25.460938 L 25.460938 28.880859 C 21.270937 26.550859 15.870313 27.160938 12.320312 30.710938 L 6.6699219 36.359375 C 4.5899219 38.439375 3.4394531 41.200625 3.4394531 44.140625 C 3.4394531 47.080625 4.5899219 49.839922 6.6699219 51.919922 L 8.0800781 53.330078 C 10.220078 55.480078 13.039375 56.550781 15.859375 56.550781 C 18.669375 56.550781 21.490625 55.480078 23.640625 53.330078 L 29.289062 47.679688 C 32.839063 44.129688 33.449141 38.729062 31.119141 34.539062 L 34.539062 31.119141 C 36.199062 32.049141 38.050391 32.509766 39.900391 32.509766 C 42.720391 32.509766 45.529687 31.439063 47.679688 29.289062 L 53.330078 23.640625 C 55.410078 21.560625 56.560547 18.799375 56.560547 15.859375 C 56.560547 12.919375 55.410078 10.160078 53.330078 8.0800781 L 51.919922 6.6699219 C 49.774922 4.5249219 46.958125 3.453125 44.140625 3.453125 z M 44.144531 5.4472656 C 46.449531 5.4472656 48.754766 6.3250781 50.509766 8.0800781 L 51.919922 9.4902344 C 53.619922 11.190234 54.560547 13.449375 54.560547 15.859375 C 54.560547 18.259375 53.619922 20.520703 51.919922 22.220703 L 46.259766 27.880859 C 44.559766 29.580859 42.300391 30.509766 39.900391 30.509766 C 38.540391 30.509766 37.219297 30.210859 36.029297 29.630859 L 39.199219 26.460938 C 39.429219 26.490938 39.660391 26.509766 39.900391 26.509766 C 41.240391 26.509766 42.489688 25.990781 43.429688 25.050781 L 49.089844 19.390625 C 50.039844 18.450625 50.560547 17.189375 50.560547 15.859375 C 50.560547 14.519375 50.039844 13.270313 49.089844 12.320312 L 47.679688 10.910156 C 45.729687 8.9601563 42.549375 8.9601563 40.609375 10.910156 L 34.949219 16.560547 C 34.009219 17.510547 33.490234 18.759609 33.490234 20.099609 C 33.490234 20.339609 33.509063 20.570781 33.539062 20.800781 L 30.369141 23.970703 C 29.789141 22.780703 29.490234 21.459609 29.490234 20.099609 C 29.490234 17.699609 30.419141 15.440234 32.119141 13.740234 L 37.779297 8.0800781 C 39.534297 6.3250781 41.839531 5.4472656 44.144531 5.4472656 z M 24.746094 9.2734375 C 24.617703 9.2554844 24.483813 9.261625 24.351562 9.296875 C 23.817563 9.439875 23.500531 9.9874844 23.644531 10.521484 L 24.164062 12.455078 C 24.284063 12.902078 24.686906 13.195312 25.128906 13.195312 C 25.214906 13.195312 25.302672 13.184156 25.388672 13.160156 C 25.922672 13.017156 26.239703 12.469547 26.095703 11.935547 L 25.576172 10.003906 C 25.468172 9.6034062 25.131266 9.3272969 24.746094 9.2734375 z M 19.664062 11.269531 C 19.535328 11.285625 19.406109 11.327234 19.287109 11.396484 C 18.808109 11.672484 18.644875 12.283719 18.921875 12.761719 L 19.921875 14.494141 C 20.107875 14.815141 20.443063 14.994141 20.789062 14.994141 C 20.959063 14.994141 21.130109 14.950375 21.287109 14.859375 C 21.766109 14.583375 21.931297 13.972141 21.654297 13.494141 L 20.654297 11.761719 C 20.446547 11.402469 20.050266 11.22125 19.664062 11.269531 z M 44.140625 11.443359 C 44.908125 11.443359 45.674766 11.735312 46.259766 12.320312 L 47.679688 13.740234 C 48.239688 14.300234 48.560547 15.059375 48.560547 15.859375 C 48.560547 16.659375 48.239688 17.410469 47.679688 17.980469 L 42.019531 23.640625 C 41.799531 23.860625 41.539766 24.039687 41.259766 24.179688 C 41.599766 23.589688 41.779297 22.920703 41.779297 22.220703 C 41.779297 21.150703 41.359375 20.150625 40.609375 19.390625 C 39.849375 18.640625 38.849297 18.220703 37.779297 18.220703 C 37.079297 18.220703 36.410312 18.400234 35.820312 18.740234 C 35.950313 18.460234 36.139375 18.210469 36.359375 17.980469 L 42.019531 12.320312 C 42.604531 11.735312 43.373125 11.443359 44.140625 11.443359 z M 15.646484 14.441406 C 15.390734 14.441406 15.134953 14.538875 14.939453 14.734375 C 14.548453 15.125375 14.548453 15.757437 14.939453 16.148438 L 16.353516 17.5625 C 16.548516 17.7575 16.804547 17.855469 17.060547 17.855469 C 17.316547 17.855469 17.572578 17.7575 17.767578 17.5625 C 18.158578 17.1715 18.158578 16.539438 17.767578 16.148438 L 16.353516 14.734375 C 16.158016 14.538875 15.902234 14.441406 15.646484 14.441406 z M 12.591797 18.589844 C 12.204937 18.541703 11.808562 18.722781 11.601562 19.082031 C 11.324562 19.560031 11.48975 20.172219 11.96875 20.449219 L 13.699219 21.449219 C 13.856219 21.540219 14.029219 21.582031 14.199219 21.582031 C 14.545219 21.582031 14.881406 21.403031 15.066406 21.082031 C 15.342406 20.603031 15.177219 19.992797 14.699219 19.716797 L 12.96875 18.716797 C 12.849 18.647797 12.72075 18.605891 12.591797 18.589844 z M 37.779297 20.220703 C 38.309297 20.220703 38.809453 20.430547 39.189453 20.810547 C 39.569453 21.190547 39.779297 21.690703 39.779297 22.220703 C 39.779297 22.760703 39.569453 23.260625 39.189453 23.640625 L 38.609375 24.220703 L 37.150391 25.679688 L 34.279297 28.550781 L 32.869141 29.960938 L 29.970703 32.859375 L 28.550781 34.279297 L 25.679688 37.150391 L 24.220703 38.609375 L 23.640625 39.189453 C 23.260625 39.569453 22.740703 39.759766 22.220703 39.759766 C 21.700703 39.759766 21.180547 39.569453 20.810547 39.189453 C 20.430547 38.809453 20.220703 38.309297 20.220703 37.779297 C 20.220703 37.239297 20.430547 36.739375 20.810547 36.359375 L 21.390625 35.779297 L 22.849609 34.320312 L 25.720703 31.449219 L 27.140625 30.029297 L 30.029297 27.140625 L 31.449219 25.720703 L 34.320312 22.849609 L 35.779297 21.390625 L 36.359375 20.810547 C 36.739375 20.430547 37.239297 20.220703 37.779297 20.220703 z M 10.333984 23.416016 C 9.9482969 23.469875 9.6111563 23.745984 9.5039062 24.146484 C 9.3609063 24.680484 9.6779375 25.228094 10.210938 25.371094 L 12.142578 25.890625 C 12.229578 25.913625 12.316344 25.925781 12.402344 25.925781 C 12.843344 25.925781 13.248188 25.630594 13.367188 25.183594 C 13.510188 24.650594 13.193156 24.100031 12.660156 23.957031 L 10.728516 23.439453 C 10.595766 23.404203 10.462547 23.398062 10.333984 23.416016 z M 54.341797 28.417969 C 53.061297 28.418219 51.782594 28.904906 50.808594 29.878906 L 48.736328 31.949219 L 48.736328 31.951172 L 48.580078 32.105469 L 47.980469 32.707031 C 47.978469 32.709031 47.978563 32.710891 47.976562 32.712891 L 44.943359 35.755859 C 44.933359 35.765859 44.918203 35.769297 44.908203 35.779297 C 44.898203 35.789297 44.896719 35.803453 44.886719 35.814453 L 30.138672 50.607422 C 29.979672 50.766422 29.878516 50.973266 29.853516 51.197266 L 29.119141 57.507812 L 28.412109 62.457031 C 28.368109 62.769031 28.473312 63.083641 28.695312 63.306641 C 28.883312 63.495641 29.138344 63.599609 29.402344 63.599609 C 29.449344 63.599609 29.496922 63.596844 29.544922 63.589844 L 34.466797 62.886719 L 40.851562 62.210938 C 41.080562 62.186937 41.292078 62.084875 41.455078 61.921875 L 59.296875 44.021484 L 62.123047 41.193359 C 63.067047 40.249359 63.587891 38.993203 63.587891 37.658203 C 63.585891 36.320203 63.065094 35.065094 62.121094 34.121094 L 57.878906 29.878906 C 56.903906 28.903906 55.622297 28.417719 54.341797 28.417969 z M 20.099609 29.490234 C 21.459609 29.490234 22.780703 29.789141 23.970703 30.369141 L 20.800781 33.539062 C 20.570781 33.509062 20.339609 33.490234 20.099609 33.490234 C 18.759609 33.490234 17.510312 34.009219 16.570312 34.949219 L 10.910156 40.609375 C 9.9601563 41.549375 9.4394531 42.810625 9.4394531 44.140625 C 9.4394531 45.480625 9.9601562 46.729688 10.910156 47.679688 L 12.320312 49.089844 C 13.300313 50.069844 14.579375 50.550781 15.859375 50.550781 C 17.139375 50.550781 18.420625 50.069844 19.390625 49.089844 L 25.050781 43.439453 C 25.990781 42.489453 26.509766 41.240391 26.509766 39.900391 C 26.509766 39.660391 26.490938 39.429219 26.460938 39.199219 L 29.630859 36.029297 C 30.210859 37.219297 30.509766 38.540391 30.509766 39.900391 C 30.509766 42.300391 29.580859 44.559766 27.880859 46.259766 L 22.220703 51.919922 C 18.710703 55.429922 13.000234 55.429922 9.4902344 51.919922 L 8.0800781 50.509766 C 6.3800781 48.809766 5.4394531 46.550625 5.4394531 44.140625 C 5.4394531 41.740625 6.3800781 39.479297 8.0800781 37.779297 L 13.740234 32.119141 C 15.440234 30.419141 17.699609 29.490234 20.099609 29.490234 z M 54.341797 30.416016 C 55.110047 30.415766 55.879344 30.707969 56.464844 31.292969 L 60.707031 35.535156 C 61.273031 36.102156 61.585938 36.856203 61.585938 37.658203 C 61.585938 38.458203 61.273031 39.210344 60.707031 39.777344 L 58.585938 41.898438 L 50.101562 33.414062 L 52.222656 31.292969 C 52.807156 30.708969 53.573547 30.416266 54.341797 30.416016 z M 48.689453 34.830078 L 57.173828 43.314453 L 55.519531 44.974609 L 47.033203 36.490234 L 48.689453 34.830078 z M 18.740234 35.820312 C 18.400234 36.410313 18.220703 37.079297 18.220703 37.779297 C 18.220703 38.849297 18.640625 39.849375 19.390625 40.609375 C 20.150625 41.359375 21.150703 41.779297 22.220703 41.779297 C 22.920703 41.779297 23.589688 41.599766 24.179688 41.259766 C 24.049688 41.539766 23.860625 41.789531 23.640625 42.019531 L 17.980469 47.679688 C 16.810469 48.849688 14.910234 48.849688 13.740234 47.679688 L 12.320312 46.259766 C 11.760312 45.699766 11.439453 44.940625 11.439453 44.140625 C 11.439453 43.340625 11.760313 42.589531 12.320312 42.019531 L 17.980469 36.359375 C 18.200469 36.139375 18.460234 35.960312 18.740234 35.820312 z M 45.621094 37.90625 L 54.107422 46.390625 L 41.455078 59.082031 L 41.003906 54.716797 C 40.949906 54.206797 40.522766 53.820313 40.009766 53.820312 L 38.181641 53.820312 L 38.181641 52.404297 L 43.544922 47.041016 C 43.935922 46.650016 43.935922 46.017953 43.544922 45.626953 C 43.153922 45.235953 42.521859 45.235953 42.130859 45.626953 L 36.810547 50.945312 L 33.019531 50.546875 L 45.621094 37.90625 z M 31.724609 52.421875 L 36.181641 52.890625 L 36.181641 54.818359 C 36.181641 55.370359 36.628641 55.818359 37.181641 55.818359 L 39.107422 55.818359 L 39.574219 60.330078 L 34.720703 60.845703 L 31.158203 57.283203 L 31.724609 52.421875 z"/></svg>'
        ),
        yield this.loadSettings(),
        this.addSettingTab(new n(this.app, this)),
        this.addCommand({
          id: "convert-wikis-to-md-in-active-file",
          name: "活动文件: WikiLinks 转换成 MDLinks",
          callback: () => {
            l(this, "markdown");
          },
        }),
        this.addCommand({
          id: "convert-md-to-wikis-in-active-file",
          name: "活动文件: MDLinks 转换成 WikiLinks",
          callback: () => {
            l(this, "wiki");
          },
        }),
        this.addCommand({
          id: "convert-wikis-to-md-in-vault",
          name: "所有文件: WikiLinks 转换成 MDLinks",
          callback: () => {
            new x(this.app, "您确定要将所有 WikiLinks 转换成 MDLinks吗?", () =>
              C(this, "markdown")
            ).open();
          },
        }),
        this.addCommand({
          id: "convert-mdlinks-to-wiki-in-vault",
          name: "所有文件: MDLinks 转换成 WikiLinks",
          callback: () => {
            new x(
              this.app,
              "您确定要将所有 MDLinks 转换成 WikiLinkslinks?",
              () => C(this, "wiki")
            ).open();
          },
        }),
        this.addCommand({
          id: "convert-wikis-to-mdlink-under-folder",
          name: "特定文件夹: Links 转换成 MDLinks",
          callback: () => {
            new F(this, "markdown").open();
          },
        }),
        this.addCommand({
          id: "convert-mdlinks-to-wikis-under-folder",
          name: "特定文件夹: Links 转换成 WikiLinks",
          callback: () => {
            new F(this, "wiki").open();
          },
        }),
        this.addCommand({
          id: "convert-wikis-to-mdlinks-within-selection",
          name: "选中的编辑内容: Links 转换成 MDLinks",
          callback: () =>
            e(this, void 0, void 0, function* () {
              return r("markdown", this);
            }),
        }),
        this.addCommand({
          id: "convert-mdlinks-to-wiki-within-selection",
          name: "选中的编辑内容: Links 转换成 WikiLinks",
          callback: () =>
            e(this, void 0, void 0, function* () {
              return r("wiki", this);
            }),
        }),
        this.settings.contextMenu &&
          this.app.workspace.on("file-menu", this.addFileMenuItems);
    });
  }
  onunload() {
    console.log("Link Converter 卸载中..."),
      this.app.workspace.off("file-menu", this.addFileMenuItems);
  }
  loadSettings() {
    return e(this, void 0, void 0, function* () {
      this.settings = Object.assign({}, i, yield this.loadData());
    });
  }
  saveSettings() {
    return e(this, void 0, void 0, function* () {
      yield this.saveData(this.settings);
    });
  }
}
module.exports = T;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsInNyYy9zZXR0aW5ncy50cyIsInNyYy91dGlscy50cyIsInNyYy9jb252ZXJ0ZXIudHMiLCJzcmMvbW9kYWxzLnRzIiwic3JjL21haW4udHMiLCJzcmMvaWNvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOm51bGwsIm5hbWVzIjpbIl9fYXdhaXRlciIsInRoaXNBcmciLCJfYXJndW1lbnRzIiwiUCIsImdlbmVyYXRvciIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZnVsZmlsbGVkIiwidmFsdWUiLCJzdGVwIiwibmV4dCIsImUiLCJyZWplY3RlZCIsInJlc3VsdCIsImRvbmUiLCJ0aGVuIiwiYXBwbHkiLCJERUZBVUxUX1NFVFRJTkdTIiwibXlTZXR0aW5nIiwiY29udGV4dE1lbnUiLCJmaW5hbExpbmtGb3JtYXQiLCJrZWVwTXRpbWUiLCJMaW5rQ29udmVydGVyU2V0dGluZ3NUYWIiLCJQbHVnaW5TZXR0aW5nVGFiIiwiY29uc3RydWN0b3IiLCJhcHAiLCJwbHVnaW4iLCJzdXBlciIsInRoaXMiLCJkaXNwbGF5IiwiY29udGFpbmVyRWwiLCJlbXB0eSIsImNyZWF0ZUVsIiwidGV4dCIsIlNldHRpbmciLCJzZXROYW1lIiwic2V0RGVzYyIsImFkZFRvZ2dsZSIsInRvZ2dsZSIsInNldFZhbHVlIiwic2V0dGluZ3MiLCJvbkNoYW5nZSIsIm5ld1ZhbCIsInNhdmVTZXR0aW5ncyIsIndvcmtzcGFjZSIsIm9uIiwiYWRkRmlsZU1lbnVJdGVtcyIsIm9mZiIsImFkZERyb3Bkb3duIiwiZHJvcGRvd24iLCJhZGRPcHRpb24iLCJvcHRpb24iLCJjb2ZmZWVEaXYiLCJjcmVhdGVEaXYiLCJhZGRDbGFzcyIsImhyZWYiLCJhdHRyIiwic3JjIiwiaGVpZ2h0IiwiZ2V0QWxsTGlua01hdGNoZXNJbkZpbGUiLCJtZEZpbGUiLCJsaW5rTWF0Y2hlcyIsImZpbGVUZXh0IiwidmF1bHQiLCJyZWFkIiwid2lraU1hdGNoZXMiLCJtYXRjaCIsImZpbGVSZWdleCIsImFsdFJlZ2V4Iiwid2lraU1hdGNoIiwibWF0Y2hJc1dpa2lUcmFuc2NsdXNpb24iLCJmaWxlTmFtZSIsImdldFRyYW5zY2x1c2lvbkZpbGVOYW1lIiwiYmxvY2tSZWZNYXRjaCIsImdldFRyYW5zY2x1c2lvbkJsb2NrUmVmIiwibGlua01hdGNoIiwidHlwZSIsImxpbmtUZXh0IiwiYWx0T3JCbG9ja1JlZiIsInNvdXJjZUZpbGVQYXRoIiwicGF0aCIsInB1c2giLCJmaWxlTWF0Y2giLCJzdGFydHNXaXRoIiwiYWx0TWF0Y2giLCJtYXJrZG93bk1hdGNoZXMiLCJtYXJrZG93bk1hdGNoIiwibWF0Y2hJc01kVHJhbnNjbHVzaW9uIiwiY29udmVydExpbmtzQW5kU2F2ZUluU2luZ2xlRmlsZSIsImZpbmFsRm9ybWF0IiwibmV3RmlsZVRleHQiLCJjb252ZXJ0V2lraUxpbmtzVG9NYXJrZG93biIsImNvbnZlcnRNYXJrZG93bkxpbmtzVG9XaWtpTGlua3MiLCJmaWxlU3RhdCIsImFkYXB0ZXIiLCJzdGF0Iiwibm9ybWFsaXplUGF0aCIsIm1vZGlmeSIsImNvbnZlcnRMaW5rc0luQWN0aXZlRmlsZSIsImdldEFjdGl2ZUZpbGUiLCJleHRlbnNpb24iLCJOb3RpY2UiLCJjb252ZXJ0TGlua3NVbmRlckZvbGRlciIsImZvbGRlciIsIm1kRmlsZXMiLCJmaWxlc1VuZGVyUGF0aCIsInJlY3Vyc2l2ZUZ4IiwiZm9sZGVyT2JqIiwiZ2V0QWJzdHJhY3RGaWxlQnlQYXRoIiwiVEZvbGRlciIsImNoaWxkcmVuIiwiY2hpbGQiLCJURmlsZSIsImdldEZpbGVzVW5kZXJQYXRoIiwibm90aWNlIiwidG90YWxDb3VudCIsImxlbmd0aCIsImNvdW50ZXIiLCJzZXRNZXNzYWdlIiwiaGFzRnJvbnRtYXR0ZXIiLCJlcnIiLCJjb25zb2xlIiwibG9nIiwiaGlkZSIsImNvbnZlcnRMaW5rc1dpdGhpblNlbGVjdGlvbiIsImFjdGl2ZUxlYWYiLCJnZXRBY3RpdmVWaWV3T2ZUeXBlIiwiTWFya2Rvd25WaWV3IiwiZWRpdG9yIiwic2VsZWN0aW9uIiwiZ2V0U2VsZWN0aW9uIiwic291cmNlRmlsZSIsImZpbGUiLCJuZXdUZXh0IiwicmVwbGFjZVNlbGVjdGlvbiIsImNvbnZlcnRMaW5rc0luVmF1bHQiLCJnZXRSb290IiwiZmlsZVBhdGgiLCJrZXlUb0NoZWNrIiwibWV0YUNhY2hlIiwibWV0YWRhdGFDYWNoZSIsImdldENhY2hlIiwiZnJvbnRtYXR0ZXIiLCJtZCIsIm5ld01kVGV4dCIsImZpbHRlciIsIm1kTGluayIsImNyZWF0ZUxpbmsiLCJyZXBsYWNlIiwid2lraVRyYW5zY2x1c2lvbnMiLCJ3aWtpVHJhbnNjbHVzaW9uIiwid2lraVRyYW5zY2x1c2lvbkxpbmsiLCJ3aWtpTGluayIsIm1kVHJhbnNjbHVzaW9ucyIsIm1kVHJhbnNjbHVzaW9uIiwiZ2V0RmlsZUxpbmtJbkZvcm1hdCIsImZpbGVMaW5rIiwibGlua2VkRmlsZVBhdGgiLCJ0cmltIiwiYXJyIiwic3RhcnQiLCJlbmQiLCJzbGljZSIsImZyb21QYXJ0cyIsInNwbGl0IiwidG9QYXJ0cyIsIk1hdGgiLCJtaW4iLCJzYW1lUGFydHNMZW5ndGgiLCJpIiwib3V0cHV0UGFydHMiLCJjb25jYXQiLCJqb2luIiwiZ2V0UmVsYXRpdmVMaW5rIiwiZ2V0RmlsZXMiLCJmIiwibmFtZSIsImVuZHNXaXRoIiwiZGVzdCIsIm9yaWdpbmFsTGluayIsImFsdFRleHQiLCJmaW5hbExpbmsiLCJkZWNvZGVVUkkiLCJnZXRGaXJzdExpbmtwYXRoRGVzdCIsImZpbGVFeHRlbnNpb24iLCJiYXNlbmFtZSIsImVuY29kZVVSSSIsImVuY29kZWRCbG9ja1JlZiIsIndpa2lUcmFuc2NsdXNpb25SZWdleCIsIndpa2lUcmFuc2NsdXNpb25GaWxlTmFtZVJlZ2V4Iiwid2lraVRyYW5zY2x1c2lvbkJsb2NrUmVmIiwibWRUcmFuc2NsdXNpb25SZWdleCIsIm1kVHJhbnNjbHVzaW9uRmlsZU5hbWVSZWdleCIsIm1kVHJhbnNjbHVzaW9uQmxvY2tSZWYiLCJ0ZXN0IiwiaXNXaWtpIiwiaXNNZCIsImZpbGVOYW1lTWF0Y2giLCJDb25maXJtYXRpb25Nb2RhbCIsIk1vZGFsIiwibWVzc2FnZSIsImNhbGxiYWNrIiwib25PcGVuIiwiY29udGVudEVsIiwibWFpbkRpdiIsImlubmVySFRNTCIsImFkZEV2ZW50TGlzdGVuZXIiLCJjbG9zZSIsImNhbmNlbEJ1dHRvbiIsInN0eWxlIiwiY3NzVGV4dCIsIkZvbGRlclN1Z2dlc3Rpb25Nb2RhbCIsIkZ1enp5U3VnZ2VzdE1vZGFsIiwiZ2V0SXRlbVRleHQiLCJpdGVtIiwiZ2V0SXRlbXMiLCJmb2xkZXJzIiwicm9vdEZvbGRlciIsImNoaWxkRm9sZGVyIiwiZ2V0QWxsRm9sZGVyc0luVmF1bHQiLCJvbkNob29zZUl0ZW0iLCJldnQiLCJpbmZvVGV4dCIsIkNvbnZlcnRlci5jb252ZXJ0TGlua3NVbmRlckZvbGRlciIsIm9wZW4iLCJMaW5rQ29udmVydGVyUGx1Z2luIiwiUGx1Z2luIiwibWVudSIsImFkZFNlcGFyYXRvciIsImFkZEl0ZW0iLCJzZXRUaXRsZSIsInNldEljb24iLCJvbkNsaWNrIiwiQ29udmVydGVyLmNvbnZlcnRMaW5rc0FuZFNhdmVJblNpbmdsZUZpbGUiLCJDb252ZXJ0ZXIuY29udmVydExpbmtzSW5GaWxlVG9QcmVmZXJyZWRGb3JtYXQiLCJvbmxvYWQiLCJhZGRJY29uIiwibG9hZFNldHRpbmdzIiwiYWRkU2V0dGluZ1RhYiIsImFkZENvbW1hbmQiLCJpZCIsIkNvbnZlcnRlci5jb252ZXJ0TGlua3NJbkFjdGl2ZUZpbGUiLCJDb252ZXJ0ZXIuY29udmVydExpbmtzSW5WYXVsdCIsIkNvbnZlcnRlci5jb252ZXJ0TGlua3NXaXRoaW5TZWxlY3Rpb24iLCJvbnVubG9hZCIsIk9iamVjdCIsImFzc2lnbiIsImxvYWREYXRhIiwic2F2ZURhdGEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2dGQXFFTyxTQUFTQSxFQUFVQyxFQUFTQyxFQUFZQyxF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
