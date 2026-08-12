import fs from "node:fs";
import { PrismaClient } from "../backend/src/generated/prisma/index.js";
for (const line of fs.readFileSync("backend/.env", "utf8").split(/\r?\n/)) { const separator=line.indexOf("="); if(separator<1) continue; let value=line.slice(separator+1).trim(); if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'"))) value=value.slice(1,-1); process.env[line.slice(0,separator).trim()]=value; }
const prisma=new PrismaClient(); console.log(await prisma.$queryRawUnsafe('SELECT email, role FROM "gtf_agents" ORDER BY email')); await prisma.$disconnect();
