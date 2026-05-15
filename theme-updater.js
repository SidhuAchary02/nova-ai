const fs = require('fs');
const path = require('path');

const replacements = {
    'bg-slate-950': 'bg-nova-bg',
    'bg-slate-900': 'bg-white',
    'bg-slate-800': 'bg-gray-50',
    'bg-slate-700': 'bg-gray-100',
    'bg-slate-900/60': 'bg-white shadow-sm',
    'bg-slate-900/50': 'bg-white shadow-sm',
    'bg-slate-900/80': 'bg-white',
    'bg-slate-950/40': 'bg-nova-bg',
    'bg-slate-950/50': 'bg-nova-bg',
    'bg-slate-950/60': 'bg-nova-bg',
    'bg-slate-950/70': 'bg-nova-bg',
    'bg-slate-950/80': 'bg-white/80',
    'bg-slate-950/85': 'bg-white/90',
    'bg-slate-950/90': 'bg-white',
    'text-slate-50': 'text-nova-heading',
    'text-slate-100': 'text-nova-heading',
    'text-slate-200': 'text-nova-heading',
    'text-slate-300': 'text-nova-body',
    'text-slate-400': 'text-nova-body',
    'text-slate-500': 'text-gray-400',
    'text-slate-600': 'text-gray-400',
    'text-slate-700': 'text-gray-500',
    'text-slate-800': 'text-nova-heading',
    'text-slate-950': 'text-white',
    'border-white/5': 'border-black/5',
    'border-white/10': 'border-black/5',
    'border-white/15': 'border-black/10',
    'border-white/20': 'border-black/10',
    'border-white/30': 'border-black/20',
    'shadow-\\[0_24px_80px_rgba\\(0\\,0\\,0\\,0\\.35\\)\\]': 'shadow-soft',
    'shadow-\\[0_10px_28px_rgba\\(2\\,6\\,23\\,0\\.45\\)\\]': 'shadow-sm',
    'glass-panel': 'bg-white border border-black/5 shadow-soft',
};

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const targets = [
    'c:/Users/anshu/Desktop/nova/nova-ai/app/create-course',
    'c:/Users/anshu/Desktop/nova/nova-ai/app/course',
    'c:/Users/anshu/Desktop/nova/nova-ai/app/_components'
];

targets.forEach(target => {
    if (fs.existsSync(target)) {
        walkDir(target, function(filePath) {
            if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
                let content = fs.readFileSync(filePath, 'utf8');
                let newContent = content;
                
                for (const [key, value] of Object.entries(replacements)) {
                    const regex = new RegExp(key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                    newContent = newContent.replace(regex, value);
                }
                
                if (content !== newContent) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    console.log(`Updated: ${filePath}`);
                }
            }
        });
    }
});
