
import React from 'react';
import { Card, CardBody } from '@/components/Card';

const PublicProfileRoutines: React.FC = () => {
  return (
    <Card>
      <CardBody>
        <h3 className="font-semibold mb-4">Rutinas Públicas</h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>Próximamente podrás ver las rutinas públicas de este usuario</p>
        </div>
      </CardBody>
    </Card>
  );
};

export default PublicProfileRoutines;
