export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Fitness App. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
