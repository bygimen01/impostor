import type {ButtonHTMLAttributes,ReactNode} from 'react'
export default function Button({children,className='',...Props}:ButtonHTMLAttributes<HTMLButtonElement>&{children:ReactNode}){return <button className={`button ${className}`} {...Props}>{children}</button>}
