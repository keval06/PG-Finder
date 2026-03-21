import EditListingClient from "./EditClient.jsx";

export default async function EditListingPage({ params }) {
  const { id } = await params;
  return <EditListingClient pgId={id} />;
}