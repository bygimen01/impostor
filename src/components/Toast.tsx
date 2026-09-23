export default function Toast({Message,Kind='error'}:{Message:string;Kind?:'error'|'info'}){if(!Message)return null;return <div className={`toast ${Kind}`}>{Message}</div>}
