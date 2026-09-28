import {defineRouteConfig} from "@medusajs/admin-sdk"
import {Container,Heading,Text,Button,Input,Label,Textarea,Table,Badge} from "@medusajs/ui"
import {useEffect,useState} from "react"
async function request(path:string,body?:unknown) {
 const response=await fetch(path,{credentials:"include",method:body?"POST":"GET",headers:{"Content-Type":"application/json"},...(body?{body:JSON.stringify(body)}:{})})
 const data=await response.json();if(!response.ok)throw new Error(data.message||"Operation failed");return data
}
export default function CommercePage() {
 const [kind,setKind]=useState("attempt"),[rows,setRows]=useState<any[]>([]),[message,setMessage]=useState(""),[busy,setBusy]=useState(false)
 const [catalog,setCatalog]=useState({variant_id:"",canonical_name:"",canonical_sku:"",format:"vial",evidence_ref:"",destinations:["gb"],version:"v1",state:"approved"})
 const [settings,setSettings]=useState(""),[refund,setRefund]=useState({order_id:"",amount:"",note:"",operation_id:""})
 const [bank,setBank]=useState({attempt_id:"",bank_transaction_id:"",statement_reference:"",amount:""})
 const [release,setRelease]=useState({order_id:"",allocations:"[]"})
 const load=async()=>{try{setRows((await request(`/admin/commerce?kind=${kind}`)).records)}catch(e:any){setMessage(e.message)}}
 useEffect(()=>{void load()},[kind])
 useEffect(()=>{request("/admin/commerce/settings").then(r=>{if(r.settings){const {reviewer,...data}=r.settings.data;setSettings(JSON.stringify({...data,tax_policy:"stripe_default",enabled:r.settings.state==="enabled"},null,2))}}).catch(e=>setMessage(e.message))},[])
 const saveSettings=async()=>{const data=JSON.parse(settings||"{}");await request("/admin/commerce/settings",{...data,tax_policy:"stripe_default"})}
 const run=async(fn:()=>Promise<any>)=>{setBusy(true);setMessage("");try{await fn();setMessage("Saved. Review the updated status below.");await load()}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}
 return <Container className="divide-y p-0">
  <div className="flex flex-col gap-3 px-6 py-4"><Heading>Payments and subscriptions</Heading><Text>Review payment processing, catalogue approvals and recovery tasks. Dispatch remains a separate operation.</Text>
   <Text role="status">{message}</Text>
   <div className="flex flex-wrap gap-2">{["attempt","receipt","subscription","event","operation","shipment","reconciliation","catalog"].map(k=><Button key={k} variant={kind===k?"primary":"secondary"} onClick={()=>setKind(k)}>{k}</Button>)}</div>
  </div>
  <Table><Table.Header><Table.Row><Table.HeaderCell>Reference</Table.HeaderCell><Table.HeaderCell>Status</Table.HeaderCell><Table.HeaderCell>Account</Table.HeaderCell><Table.HeaderCell>Action</Table.HeaderCell></Table.Row></Table.Header>
   <Table.Body>{rows.map(row=><Table.Row key={row.id}><Table.Cell>{row.id}<details><summary>Details</summary><pre className="max-w-xl overflow-auto text-xs">{JSON.stringify(row.data,null,2)}</pre></details></Table.Cell><Table.Cell><Badge>{row.state}</Badge></Table.Cell><Table.Cell>{row.profile}</Table.Cell><Table.Cell>
    {row.kind==="event"&&row.state!=="done"&&<Button size="small" disabled={busy} onClick={()=>run(()=>request("/admin/commerce/replay",{event_id:row.id}))}>Replay</Button>}
    {row.kind==="receipt"&&row.data.order_id&&<Button size="small" variant="secondary" onClick={()=>setRefund({order_id:row.data.order_id,amount:"",note:"",operation_id:crypto.randomUUID()})}>Refund</Button>}
    {row.kind==="subscription"&&["pause","resume","cancel"].map(action=><Button key={action} size="small" variant="secondary" disabled={busy} onClick={()=>run(()=>request("/admin/commerce/subscriptions",{subscription_id:row.id,action,operation_id:crypto.randomUUID()}))}>{action}</Button>)}
   </Table.Cell></Table.Row>)}</Table.Body></Table>
  {refund.order_id&&<form className="flex flex-col gap-3 p-6" onSubmit={e=>{e.preventDefault();void run(async()=>{const result=await request("/admin/commerce/refunds",refund);if(result.status!=="succeeded")throw new Error(`Refund is ${result.status}; retry this same operation after reconciliation.`);setRefund({...refund,order_id:""})})}}>
   <Heading level="h2">Refund {refund.order_id}</Heading><Label>Amount in GBP</Label><Input required value={refund.amount} onChange={e=>setRefund({...refund,amount:e.target.value})}/><Label>Reason</Label><Textarea value={refund.note} onChange={e=>setRefund({...refund,note:e.target.value})}/><Text>Refunding does not cancel a subscription or restock returned goods.</Text><Button disabled={busy}>Issue refund</Button>
  </form>}
  <form className="flex flex-col gap-3 p-6" onSubmit={e=>{e.preventDefault();void run(()=>request("/admin/commerce/bank-transfer",bank))}}>
   <Heading level="h2">Confirm received bank funds</Heading><Text>Record a settled bank transaction from the statement. A customer screenshot is not proof of cleared funds.</Text>
   {(["attempt_id","bank_transaction_id","statement_reference","amount"] as const).map(key=><div key={key}><Label>{key.replaceAll("_"," ")}{key==="amount"?" (GBP)":""}</Label><Input required value={bank[key]} onChange={e=>setBank({...bank,[key]:e.target.value})}/></div>)}<Button disabled={busy}>Verify funds and record payment</Button>
  </form>
  <form className="flex flex-col gap-3 p-6" onSubmit={e=>{e.preventDefault();void run(()=>request("/admin/commerce/release",{order_id:release.order_id,allocations:JSON.parse(release.allocations)}))}}>
   <Heading level="h2">Release paid order for packing</Heading><Label>Order ID</Label><Input required value={release.order_id} onChange={e=>setRelease({...release,order_id:e.target.value})}/>
   <Label>Verified batch allocations</Label><Textarea rows={5} value={release.allocations} onChange={e=>setRelease({...release,allocations:e.target.value})}/>
   <Text>Provide an array containing line_id, quantity, batch_id and coa_reference for every order line. Use real batch and report references. Release permits the native fulfillment workflow; it does not mark dispatch or create a Royal Mail label.</Text><Button disabled={busy}>Release for packing</Button>
  </form>
  <form className="flex flex-col gap-3 p-6" onSubmit={e=>{e.preventDefault();void run(()=>request("/admin/commerce",catalog))}}>
   <Heading level="h2">Approve an exact catalogue variant</Heading>
   {(["variant_id","canonical_name","canonical_sku","evidence_ref","version"] as const).map(key=><div key={key}><Label>{key.replaceAll("_"," ")}</Label><Input required value={catalog[key]} onChange={e=>setCatalog({...catalog,[key]:e.target.value})}/></div>)}
   <Label>Format</Label><select value={catalog.format} onChange={e=>setCatalog({...catalog,format:e.target.value})}><option value="vial">Vial</option><option value="refill">Refill</option><option value="pen">Pen set</option></select>
   <Label>Permitted country codes, separated by commas</Label><Input value={catalog.destinations.join(",")} onChange={e=>setCatalog({...catalog,destinations:e.target.value.split(",").map(v=>v.trim().toLowerCase())})}/>
   <Text>Use the actual identity and evidence from the client. Do not infer identity from a similar name or code.</Text><Button disabled={busy}>Record catalogue approval</Button>
  </form>
  <form className="flex flex-col gap-3 p-6" onSubmit={e=>{e.preventDefault();void run(saveSettings)}}>
   <Heading level="h2">Tax configuration</Heading>
   <Text>Stripe Tax uses the default product tax code, price treatment and active registrations in the connected Stripe account. No VAT percentage is hard-coded here.</Text>
   <a href="https://dashboard.stripe.com/settings/tax" target="_blank" rel="noreferrer">Open Stripe tax settings</a>
   <Text>Sandbox accounts without completed tax setup can test payments without tax. Live checkout requires completed tax settings and active registrations. Review the correct product tax classification with the client.</Text>
   <details><summary>Advanced launch configuration</summary><Text>Enter the reviewed routing and launch settings from the deployment runbook. Stripe Dashboard controls tax calculations. Enabling checkout does not grant Stripe approval.</Text><Textarea rows={14} value={settings} onChange={e=>setSettings(e.target.value)}/></details>
   <Button disabled={busy}>Save reviewed configuration</Button>
  </form>
 </Container>
}
export const config=defineRouteConfig({label:"Payments and billing"})
