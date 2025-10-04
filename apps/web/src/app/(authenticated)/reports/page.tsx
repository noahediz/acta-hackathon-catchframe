import React from 'react'
import { columns, Payment } from './_components/columns'
import { DataTable } from './_components/data-table'

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ]
}

const ReportsPage =  async () => {

const data = await getData()

  return (
    <>
        <h1 className='font-medium text-xl'>Reports</h1>
          <DataTable columns={columns} data={data} />
    </>
  )
}

export default ReportsPage