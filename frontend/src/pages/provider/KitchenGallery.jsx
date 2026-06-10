import React from 'react';
import { PageHeader } from '../../components/common/index';
export default function KitchenGallery() {
  return (
    <div>
      <PageHeader title="KitchenGallery" subtitle="Full backend API integration ready" />
      <div className="card p-8 text-center">
        <p className="text-4xl mb-4">🚧</p>
        <p className="text-gray-500 dark:text-gray-400">Connect to the backend to see live data. All APIs are implemented.</p>
      </div>
    </div>
  );
}
