const fs = require('fs')

const queue = [];
const regHeader = 'Windows Registry Editor Version 5.00';
const whitespace = ' ';
const lineEnding = '\r\n';
const supressWhitespace = /[;"(]$|^(fi)$/;

fs.readFileSync('template', 'utf-8').split(/\r\n|\n/g).forEach((line) => {
   if (/^\s*$|^#/.test(line)) return;
   const trimed = line.replace(/^\s*|\s*$/g, '');
   if (/^HKEY_CLASSES_ROOT/.test(line)) {
      queue.push({
         key: trimed,
         name: undefined,
         cmd: []
      });
   }
   else {
      if (queue.length == 0) return;
      const last = queue[queue.length -1];
      if (!last.name)
         last.name = trimed;
      else {
         const cmd = last.cmd;
         if (cmd.length > 0 && !supressWhitespace.test(cmd[cmd.length - 1]))
            cmd.push(whitespace)
         cmd.push(trimed);
      }
   }
});

const installer = [ regHeader, '' ];
const uninstaller = [ regHeader, '' ];

queue.forEach(function(item) {
   const cmd = item.cmd.join('').replace(/"/g, '\\"');
   installer.push(['[', item.key, ']'].join(''));
   installer.push(['@="', item.name, '"'].join(''));
   installer.push(['[', item.key, '\\Command]'].join(''));
   installer.push(['@="', cmd, '"'].join(''));
   uninstaller.push(['[-', item.key, ']'].join(''));
   uninstaller.push(['[-', item.key, '\\Command]'].join(''));
});

fs.writeFileSync('install.reg', installer.join(lineEnding));
fs.writeFileSync('uninstall.reg', uninstaller.join(lineEnding));
