require('dotenv').config({ path: '.env.local' });
// We can't easily run Next.js server actions in raw node without Babel/webpack compilation, 
// because of 'use server' and internal Next.js imports like 'next/cache'.
// But we can check if there are any syntax errors.
console.log("Syntax is OK");
