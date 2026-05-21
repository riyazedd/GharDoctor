import asyncHandler from '../middleware/asyncHandler.js';
import Category from '../models/categoryModel.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { categoryName, icon, description, color } = req.body;

  const categoryExists = await Category.findOne({ categoryName });
  
  if (categoryExists) {
    res.status(400).json({ message: 'Category already exists' });
    return;
  }

  const category = await Category.create({
    categoryName,
    icon,
    description,
    color
  });

  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400).json({ message: 'Invalid category data' });
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (category) {
    res.json({ message: 'Category deleted successfully' });
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

export { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
