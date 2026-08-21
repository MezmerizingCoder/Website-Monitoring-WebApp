import React from 'react';

const cards = [
  {
    title: 'Revenue',
    amount: '$ 46,760.89',
    change: '+3%',
    changeColor: 'text-green-600',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
    color: 'text-green-500 bg-green-100 dark:text-green-100 dark:bg-green-500',
  },
  {
    title: 'New Clients',
    amount: '6,389',
    change: '+12%',
    changeColor: 'text-green-600',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    ),
    color: 'text-orange-500 bg-orange-100 dark:text-orange-100 dark:bg-orange-500',
  },
  {
    title: 'Active Users',
    amount: '376',
    change: '-5%',
    changeColor: 'text-red-600',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    color: 'text-blue-500 bg-blue-100 dark:text-blue-100 dark:bg-blue-500',
  },
  {
    title: 'Pending',
    amount: '35',
    change: '0%',
    changeColor: 'text-gray-600',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
    color: 'text-teal-500 bg-teal-100 dark:text-teal-100 dark:bg-teal-500',
  },
];

const statCards = [
  { label: 'Traffic', value: '24,531', sublabel: '62% of target', icon: '📶', color: 'bg-purple-500' },
  { label: 'Conversions', value: '7.21%', sublabel: '0.6% increase', icon: '📊', color: 'bg-blue-500' },
  { label: 'Bounce Rate', value: '28.3%', sublabel: '1.2% decrease', icon: '📉', color: 'bg-green-500' },
  { label: 'Avg. Session', value: '4m 32s', sublabel: '12s increase', icon: '⏱️', color: 'bg-orange-500' },
];

export default function Cards() {
  return (
    <div className="container px-6 mx-auto grid">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">Cards</h2>

      {/* Stat cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, i) => (
          <div key={i} className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <div className={`p-3 mr-4 rounded-full ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{card.amount}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Metric cards */}
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Metric Cards</h4>
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <div key={i} className="p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</span>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">{card.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.sublabel}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Profile card */}
      <h4 className="mb-4 text-lg font-semibold text-gray-600 dark:text-gray-300">Profile Card</h4>
      <div className="max-w-sm mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <img className="rounded-t-lg" src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" alt="" />
        <div className="p-5">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, and why they matter.</p>
          <a href="#" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300">
            Read more
            <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
