
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Performance = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Performance Tracking</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
          <CardDescription>
            Track progress and analyze student performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This section will provide insights and analytics on student performance.</p>
          <p className="mt-4 text-muted-foreground">
            Check back soon for performance tracking functionality!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Performance;
