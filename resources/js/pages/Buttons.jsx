import React from 'react';

export default function Buttons() {
  return (
    <div className="container px-6 mx-auto grid">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">Buttons</h2>

      {/* Regular buttons */}
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Regular</h4>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          <button className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple">
            Primary
          </button>
          <button className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-green-600 border border-transparent rounded-lg active:bg-green-600 hover:bg-green-700 focus:outline-none focus:shadow-outline-green">
            Green
          </button>
          <button className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-blue-600 border border-transparent rounded-lg active:bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue">
            Blue
          </button>
          <button className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-teal-600 border border-transparent rounded-lg active:bg-teal-600 hover:bg-teal-700 focus:outline-none focus:shadow-outline-teal">
            Teal
          </button>
          <button className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-red-600 border border-transparent rounded-lg active:bg-red-600 hover:bg-red-700 focus:outline-none focus:shadow-outline-red">
            Red
          </button>
        </div>
      </div>

      {/* Outline buttons */}
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Outline</h4>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          <button className="px-4 py-2 text-sm font-medium leading-5 text-purple-600 transition-colors duration-150 border border-purple-600 rounded-lg active:bg-purple-600 hover:bg-purple-600 hover:text-white focus:outline-none focus:shadow-outline-purple">
            Primary
          </button>
          <button className="px-4 py-2 text-sm font-medium leading-5 text-green-600 transition-colors duration-150 border border-green-600 rounded-lg active:bg-green-600 hover:bg-green-600 hover:text-white focus:outline-none focus:shadow-outline-green">
            Green
          </button>
          <button className="px-4 py-2 text-sm font-medium leading-5 text-blue-600 transition-colors duration-150 border border-blue-600 rounded-lg active:bg-blue-600 hover:bg-blue-600 hover:text-white focus:outline-none focus:shadow-outline-blue">
            Blue
          </button>
          <button className="px-4 py-2 text-sm font-medium leading-5 text-teal-600 transition-colors duration-150 border border-teal-600 rounded-lg active:bg-teal-600 hover:bg-teal-600 hover:text-white focus:outline-none focus:shadow-outline-teal">
            Teal
          </button>
          <button className="px-4 py-2 text-sm font-medium leading-5 text-red-600 transition-colors duration-150 border border-red-600 rounded-lg active:bg-red-600 hover:bg-red-600 hover:text-white focus:outline-none focus:shadow-outline-red">
            Red
          </button>
        </div>
      </div>

      {/* Disabled buttons */}
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Disabled</h4>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          <button className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg opacity-50 cursor-not-allowed" disabled>
            Primary
          </button>
          <button className="px-4 py-2 text-sm font-medium leading-5 text-green-600 transition-colors duration-150 border border-green-600 rounded-lg opacity-50 cursor-not-allowed" disabled>
            Green
          </button>
          <button className="px-4 py-2 text-sm font-medium leading-5 text-blue-600 transition-colors duration-150 border border-blue-600 rounded-lg opacity-50 cursor-not-allowed" disabled>
            Blue
          </button>
        </div>
      </div>

      {/* Button with icon */}
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">With Icon</h4>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Create account
          </button>
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-green-600 border border-transparent rounded-lg active:bg-green-600 hover:bg-green-700 focus:outline-none focus:shadow-outline-green">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Save
          </button>
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-red-600 border border-transparent rounded-lg active:bg-red-600 hover:bg-red-700 focus:outline-none focus:shadow-outline-red">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
