import React from 'react';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Modals() {
  const [activeModal, setActiveModal] = React.useState(null);

  return (
    <div className="container px-6 mx-auto grid">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">Modals</h2>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Click the buttons below to open different modals.</p>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => setActiveModal('info')} className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple">
            Info Modal
          </button>
          <button onClick={() => setActiveModal('success')} className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-green-600 border border-transparent rounded-lg active:bg-green-600 hover:bg-green-700 focus:outline-none focus:shadow-outline-green">
            Success Modal
          </button>
          <button onClick={() => setActiveModal('danger')} className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-red-600 border border-transparent rounded-lg active:bg-red-600 hover:bg-red-700 focus:outline-none focus:shadow-outline-red">
            Danger Modal
          </button>
        </div>
      </div>

      {/* Info Modal */}
      <Modal isOpen={activeModal === 'info'} onClose={() => setActiveModal(null)} title="Information">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">This is an informational modal. You can use it to display important information to your users.</p>
        <div className="flex justify-end">
          <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple">
            I understand
          </button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={activeModal === 'success'} onClose={() => setActiveModal(null)} title="Success!">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Your action was completed successfully. Everything is set up and ready to go.</p>
        <div className="flex justify-end">
          <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-green-600 border border-transparent rounded-lg active:bg-green-600 hover:bg-green-700 focus:outline-none focus:shadow-outline-green">
            Close
          </button>
        </div>
      </Modal>

      {/* Danger Modal */}
      <Modal isOpen={activeModal === 'danger'} onClose={() => setActiveModal(null)} title="Delete Item">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Are you sure you want to delete this item? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium leading-5 text-gray-600 transition-colors duration-150 border border-gray-300 rounded-lg hover:border-gray-500 focus:outline-none focus:shadow-outline-gray">
            Cancel
          </button>
          <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-red-600 border border-transparent rounded-lg active:bg-red-600 hover:bg-red-700 focus:outline-none focus:shadow-outline-red">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
