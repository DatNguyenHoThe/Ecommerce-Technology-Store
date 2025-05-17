"use client"

import React, { useState } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { CategoryMenu } from './CategoryMenu';

export default function MenuHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className='relative'>
      {/* icon menu */}
      <div 
      className='flex items-center text-white font-bold gap-x-1 bg-[#be0117] p-1 rounded-sm cursor-pointer'
      onClick={toggleMenu}
      >
        <span className='flex items-center'>
            <i 
            className="bi bi-list text-[22px]"
            ></i>
        </span>
        <h1 className='text-[13px]'>Danh mục</h1>
      </div>
      {isOpen && (
      <>
        <div 
        onClick={closeMenu}
        className='fixed inset-0 bg-black/50'
        >
        </div>
        <div className='absolute pt-6 right-2'>
          <CategoryMenu />
        </div>
      </>
      )}
    </div>
  )
}
