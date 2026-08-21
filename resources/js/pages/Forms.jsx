import React from 'react';

export default function Forms() {
  return (
    <div className="container px-6 mx-auto grid">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">Forms</h2>

      {/* General elements */}
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Elements</h4>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <label className="block text-sm">
          <span className="text-gray-700 dark:text-gray-400">Name</span>
          <input className="block w-full mt-1 text-sm dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:text-gray-300 dark:focus:shadow-outline-gray form-input" placeholder="Jane Doe" />
        </label>

        <div className="mt-4 text-sm">
          <span className="text-gray-700 dark:text-gray-400">Account Type</span>
          <div className="mt-2">
            <label className="inline-flex items-center text-gray-600 dark:text-gray-400">
              <input type="radio" className="text-purple-600 form-radio focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray" name="accountType" value="personal" />
              <span className="ml-2">Personal</span>
            </label>
            <label className="inline-flex items-center ml-6 text-gray-600 dark:text-gray-400">
              <input type="radio" className="text-purple-600 form-radio focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray" name="accountType" value="business" />
              <span className="ml-2">Business</span>
            </label>
          </div>
        </div>

        <label className="block mt-4 text-sm">
          <span className="text-gray-700 dark:text-gray-400">Requested Limit</span>
          <select className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-select focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray">
            <option>$1,000</option>
            <option>$5,000</option>
            <option>$10,000</option>
            <option>$25,000</option>
          </select>
        </label>

        <label className="block mt-4 text-sm">
          <span className="text-gray-700 dark:text-gray-400">Message</span>
          <textarea className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 form-textarea focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray" rows="3" placeholder="Enter some long form content." />
        </label>

        <div className="flex mt-6 text-sm">
          <label className="flex items-center dark:text-gray-400">
            <input type="checkbox" className="text-purple-600 form-checkbox focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray" />
            <span className="ml-2">I agree to the <span className="underline">privacy policy</span></span>
          </label>
        </div>
      </div>

      {/* Validation inputs */}
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Validation</h4>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <label className="block text-sm">
          <span className="text-gray-700 dark:text-gray-400">Invalid input</span>
          <input className="block w-full mt-1 text-sm border-red-600 dark:text-gray-300 dark:bg-gray-700 focus:border-red-400 focus:outline-none focus:shadow-outline-red form-input" placeholder="Jane Doe" />
          <span className="text-xs text-red-600 dark:text-red-400">Your password is too short.</span>
        </label>

        <label className="block mt-4 text-sm">
          <span className="text-gray-700 dark:text-gray-400">Valid input</span>
          <input className="block w-full mt-1 text-sm border-green-600 dark:text-gray-300 dark:bg-gray-700 focus:border-green-400 focus:outline-none focus:shadow-outline-green form-input" placeholder="Jane Doe" />
          <span className="text-xs text-green-600 dark:text-green-400">Your password is strong.</span>
        </label>

        <label className="block mt-4 text-sm">
          <span className="text-gray-700 dark:text-gray-400">Helper text</span>
          <input className="block w-full mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input" placeholder="Jane Doe" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Your password must be at least 6 characters long.</span>
        </label>
      </div>

      {/* Inputs with icons */}
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Icons</h4>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <label className="block text-sm">
          <span className="text-gray-700 dark:text-gray-400">Icon left</span>
          <div className="relative text-gray-500 focus-within:text-purple-600 dark:focus-within:text-purple-400">
            <input className="block w-full pl-10 mt-1 text-sm text-black dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input" placeholder="Jane Doe" />
            <div className="absolute inset-y-0 flex items-center ml-3 pointer-events-none">
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </label>

        <label className="block mt-4 text-sm">
          <span className="text-gray-700 dark:text-gray-400">Icon right</span>
          <div className="relative text-gray-500 focus-within:text-purple-600 dark:focus-within:text-purple-400">
            <input className="block w-full pr-10 mt-1 text-sm text-black dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input" placeholder="Jane Doe" />
            <div className="absolute inset-y-0 right-0 flex items-center mr-3 pointer-events-none">
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </label>
      </div>

      {/* Inputs with buttons */}
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Buttons</h4>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <label className="block text-sm">
          <span className="text-gray-700 dark:text-gray-400">Button left</span>
          <div className="relative">
            <input className="block w-full pl-20 mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input" placeholder="Bank account" />
            <button className="absolute inset-y-0 left-0 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 rounded-l-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple">
              Connect
            </button>
          </div>
        </label>

        <label className="block mt-4 text-sm">
          <span className="text-gray-700 dark:text-gray-400">Button right</span>
          <div className="relative">
            <input className="block w-full pr-20 mt-1 text-sm dark:text-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none focus:shadow-outline-purple dark:focus:shadow-outline-gray form-input" placeholder="Search..." />
            <button className="absolute inset-y-0 right-0 px-4 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 rounded-r-md active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </label>
      </div>

      {/* Toggle */}
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Toggle</h4>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <label className="flex items-center cursor-pointer">
            <input type="checkbox" className="hidden" />
            <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-gray-600 relative transition-colors duration-200 ease-in-out">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out" />
            </div>
            <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Default toggle</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input type="checkbox" className="hidden" defaultChecked />
            <div className="w-11 h-6 bg-purple-600 rounded-full relative transition-colors duration-200 ease-in-out">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out translate-x-5" />
            </div>
            <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Checked toggle</span>
          </label>
        </div>
      </div>
    </div>
  );
}
