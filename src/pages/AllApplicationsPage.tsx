import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dummy data for demonstration
type Application = {
  id: string;
  name: string;
  grade: string;
  status: string;
  submittedAt: string;
};

const data: Application[] = [
  {
    id: "1",
    name: "John Doe",
    grade: "Class V",
    status: "Submitted",
    submittedAt: "2024-06-01",
  },
  {
    id: "2",
    name: "Jane Smith",
    grade: "Class VIII",
    status: "Pending",
    submittedAt: "2024-06-02",
  },
  {
    id: "3",
    name: "Amit Kumar",
    grade: "Class II",
    status: "Submitted",
    submittedAt: "2024-06-03",
  },
  {
    id: "4",
    name: "Sara Lee",
    grade: "Class XI",
    status: "Submitted",
    submittedAt: "2024-06-04",
  },
];

// Define columns for the table
const columns: ColumnDef<Application>[] = [
  {
    accessorKey: "name",
    header: "Applicant Name",
  },
  {
    accessorKey: "grade",
    header: "Grade",
  },
  {
    accessorKey: "status",
    header: "Payment Status",
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted At",
  },
];

export default function AllApplicationsPage() {
  return (
    <Card className="w-full mx-auto"> {/* Max width for better readability */}
      <CardHeader>
        <CardTitle>All Applications</CardTitle>
        {/* <CardDescription>
          Please fill out the following details carefully. Fields marked with * are required.
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
}
