import React from 'react';

const tableData = [
  { name: 'Hans Burger', role: '10x Developer', avatar: 'https://images.unsplash.com/photo-1570612861542-284f4c12e75f?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max', amount: '$ 863.45', status: 'Approved', date: '6/10/2020' },
  { name: 'Jolina Angelie', role: 'Unemployed', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&facepad=3&fit=facearea&s=707b9c33066bf8808c934c8ab394dff6', amount: '$ 369.95', status: 'Pending', date: '6/10/2020' },
  { name: 'Square Velocity', role: 'Company', avatar: 'https://images.unsplash.com/photo-1551069613-1904dbdcda11?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max', amount: '$ 86.00', status: 'Approved', date: '6/10/2020' },
  { name: 'Johanna Kohl', role: 'Unemployed', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max', amount: '$ 721.79', status: 'Pending', date: '6/10/2020' },
  { name: 'Tara Kent', role: '3x Developer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max', amount: '$ 530.64', status: 'Approved', date: '6/10/2020' },
  { name: 'Mike Schiller', role: 'CEO', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max', amount: '$ 1,240.00', status: 'Approved', date: '6/10/2020' },
  { name: 'Ana Silva', role: 'Designer', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max', amount: '$ 420.00', status: 'Pending', date: '6/10/2020' },
];

const statusClasses = {
  Approved: 'px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full dark:bg-green-700 dark:text-green-100',
  Pending: 'px-2 py-1 font-semibold leading-tight text-orange-700 bg-orange-100 rounded-full dark:bg-orange-600 dark:text-white',
};

export default function Tables() {
  return (
    <div className="container px-6 mx-auto grid">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 dark:text-gray-200">Tables</h2>

      <div className="w-full overflow-hidden rounded-lg shadow-xs">
        <div className="w-full overflow-x-auto">
          <table className="w-full whitespace-no-wrap">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
              {tableData.map((row, i) => (
                <tr key={i} className="text-gray-700 dark:text-gray-400">
                  <td className="px-4 py-3">
                    <div className="flex items-center text-sm">
                      <div className="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                        <img className="object-cover w-full h-full rounded-full" src={row.avatar} alt="" loading="lazy" />
                        <div className="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold">{row.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{row.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{row.amount}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={statusClasses[row.status]}>{row.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 sm:grid-cols-9 dark:text-gray-400 dark:bg-gray-800">
          <span className="flex items-center col-span-3">Showing 1-7 of 7</span>
          <span className="flex col-span-2 sm:justify-end">
            <nav aria-label="Table navigation">
              <ul className="inline-flex items-center">
                <li>
                  <button className="px-3 py-1 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-purple" aria-label="Previous">
                    <svg className="w-4 h-4 fill-current" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
                <li>
                  <button className="px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple">1</button>
                </li>
                <li>
                  <button className="px-3 py-1 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-purple" aria-label="Next">
                    <svg className="w-4 h-4 fill-current" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              </ul>
            </nav>
          </span>
        </div>
      </div>
    </div>
  );
}
