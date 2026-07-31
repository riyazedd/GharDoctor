import React from 'react'
import {FaStar, FaStarHalfAlt, FaRegStar} from 'react-icons/fa'

const Rating = ({ value = 0, text }) => {
  return (
    <div className='flex gap-3 items-center'>
      <div className='flex gap-1 items-center text-yellow-500'>
      <span>
        { value>=1 ? <FaStar /> : value >=0.5 ? <FaStarHalfAlt /> : <FaRegStar /> }
      </span>
      <span>
        { value>=2 ? <FaStar /> : value >=1.5 ? <FaStarHalfAlt /> : <FaRegStar /> }
      </span>
      <span>
        { value>=3 ? <FaStar /> : value >=2.5 ? <FaStarHalfAlt /> : <FaRegStar /> }
      </span>
      <span>
        { value>=4 ? <FaStar /> : value >=3.5 ? <FaStarHalfAlt /> : <FaRegStar /> }
      </span>
      <span>
        { value>=5 ? <FaStar /> : value >=4.5 ? <FaStarHalfAlt /> : <FaRegStar /> }
      </span>
      </div>
      <span>{text && text}</span>
    </div>
  )
}

export default Rating