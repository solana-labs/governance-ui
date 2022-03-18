import {
  ArrowCircleLeftIcon,
  ArrowCircleRightIcon,
} from '@heroicons/react/outline'
import React from 'react'
import { Pagination } from 'react-headless-pagination'

const PaginationComponent = ({ totalPages = 5, onPageChange }) => {
  const [page, setPage] = React.useState<number>(0)

  const handlePageChange = (page: number) => {
    setPage(page)
    onPageChange(page)
  }

  return (
    <>
      {totalPages > 1 ? (
        <Pagination
          currentPage={page}
          setCurrentPage={handlePageChange}
          totalPages={totalPages}
          edgePageCount={2}
          middlePagesSiblingCount={2}
          truncableText="..."
        >
          <div className="flex flex-wrap pt-3 text-xs">
            <Pagination.PrevButton className="default-transition text-primary-light hover:text-primary-dark">
              <ArrowCircleLeftIcon className="w-6 h-6" />
            </Pagination.PrevButton>

            <div className="flex items-center justify-center flex-grow">
              <Pagination.PageButton
                activeClassName="bg-bkg-4 font-bold rounded-full text-fgd-2"
                inactiveClassName=""
                className="default-transition flex font-normal items-center justify-center mx-0.5 text-fgd-3 text-sm w-6 h-6 cursor-pointer hover:text-fgd-2"
              />
            </div>

            <Pagination.NextButton className="default-transition text-primary-light hover:text-primary-dark">
              <ArrowCircleRightIcon className="w-6 h-6" />
            </Pagination.NextButton>
          </div>
        </Pagination>
      ) : null}
    </>
  )
}

export default PaginationComponent
