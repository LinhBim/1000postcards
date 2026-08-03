'use client';

import { useState } from 'react';
import MessageModal from './MessageModal';
import styles from './WriteMeWidget.module.css';

export default function WriteMeWidget({ web3FormsKey }: { web3FormsKey?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        className={styles.widgetButton}
        onClick={() => setIsModalOpen(true)}
      >
        Write me here
      </button>

      {isModalOpen && (
        <MessageModal onClose={() => setIsModalOpen(false)} web3FormsKey={web3FormsKey} />
      )}
    </>
  );
}
