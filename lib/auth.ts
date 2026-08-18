import { cookies } from 'next/headers'; import { SignJWT, jwtVerify } from 'jose'; import bcrypt from 'bcryptjs'; import { db } from './db';
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-change-me');
export async function hashPassword(p:string){return bcrypt.hash(p,12)} export async function verifyPassword(p:string,h:string){return bcrypt.compare(p,h)}
export async function setAuth(userId:string){const token=await new SignJWT({sub:userId}).setProtectedHeader({alg:'HS256'}).setExpirationTime('7d').sign(secret);(await cookies()).set('session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:604800});}
export async function getUser(){try{const token=(await cookies()).get('session')?.value;if(!token)return null;const {payload}=await jwtVerify(token,secret);return db.user.findUnique({where:{id:String(payload.sub)},include:{profile:true}})}catch{return null}}
export async function requireUser(){const u=await getUser();if(!u)throw new Error('UNAUTHORIZED');return u}
export function requireRole(user:any,roles:string[]){if(!roles.includes(user.role))throw new Error('FORBIDDEN')}
