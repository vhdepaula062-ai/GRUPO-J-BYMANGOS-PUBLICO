import type {Metadata} from "next";
import Confirmation from "./Confirmation";
export const metadata:Metadata={title:"Confirmação de e-mail — Grupo J",robots:{index:false,follow:false},referrer:"no-referrer"};
export default function Page(){return <Confirmation/>;}
