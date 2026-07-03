import { PageHeader } from "./PageHeader";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";

// Temporary stand-in for flows that land in later build increments.
export function Placeholder({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <Card>
        <EmptyState
          title="Coming next"
          description="This screen is being built. Check back in the next update."
        />
      </Card>
    </>
  );
}
