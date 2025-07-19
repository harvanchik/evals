import { copy, emptyDir } from 'https://deno.land/std@0.224.0/fs/mod.ts';
import { fromFileUrl } from 'https://deno.land/std@0.224.0/path/mod.ts';

const build = new Deno.Command(Deno.execPath(), {
	args: ['run', '-A', 'npm:vite@latest', 'build'],
	stdout: 'inherit'
}).spawn();
await build.status;

const vercelDir = './.vercel/output';
const funcsDir = `${vercelDir}/functions/sveltekit.func`;
await emptyDir(funcsDir);
await emptyDir(`${vercelDir}/static`);

const clientDir = './build/client';
const serverDir = './build/server';

await copy(clientDir, `${vercelDir}/static/_app`);
await copy(serverDir, funcsDir);

await Deno.writeTextFile(
	`${funcsDir}/.vc-config.json`,
	JSON.stringify(
		{
			runtime: 'deno',
			entrypoint: 'index.js'
		},
		null,
		2
	)
);
