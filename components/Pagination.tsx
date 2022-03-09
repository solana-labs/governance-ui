import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/outline'
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
          className=""
          truncableText="..."
          truncableClassName=""
        >
          <div className="flex flex-wrap pt-3 text-xs">
            <Pagination.PrevButton className="">
              <ArrowLeftIcon className="w-4 h-4 text-primary-light"></ArrowLeftIcon>
            </Pagination.PrevButton>

            <div className="flex items-center justify-center flex-grow">
              <Pagination.PageButton
                activeClassName="opacity-60"
                inactiveClassName=""
                className="text-primary-light mx-1 hover:opacity-60 cursor-pointer"
              />
            </div>

            <Pagination.NextButton className="">
              <ArrowRightIcon className="w-4 h-4 text-primary-light"></ArrowRightIcon>
            </Pagination.NextButton>
          </div>
        </Pagination>
      ) : null}
    </>
  )
}

export default PaginationComponent
