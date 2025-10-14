

//  U T I L I T I E S  ----------------------------------------------------------- //

export { cn } from './utils';


//  S V E L T E   C O M P O N E N T S  ----------------------------------------------- //

export { default as Button } from './components/Button.svelte';
export { default as IconButton } from './components/IconButton.svelte';
export { default as ProductList } from './components/product-list/ProductList.svelte';
export { default as MetricsBlock } from './components/metrics/MetricsBlock.svelte';
export { default as Footer } from './components/footer/Footer.svelte';
export { default as ThemeToggle } from './components/footer/ThemeToggle.svelte';
export { default as Sun } from './components/icons/Sun.svelte';
export { default as Moon } from './components/icons/Moon.svelte';
export { default as X } from './components/icons/X.svelte';
export { default as Email } from './components/icons/Email.svelte';
export { default as Downloads } from './components/icons/Downloads.svelte';
export { default as Subscriptions } from './components/icons/Subscriptions.svelte';
export { default as Users } from './components/icons/Users.svelte';
export { default as Logo } from './components/icons/Logo.svelte';
export { default as CloseDrawer } from './components/icons/CloseDrawer.svelte';
export { default as APIIcon } from './components/icons/APIIcon.svelte'


//  S T O R E S  ----------------------------------------------------------------- //

export { authStore, completeAuthFlow, clearAuthState, setAuthenticated } from './stores/auth';


//  S T A T E  --------------------------------------------------- //

export { 
    handleEditProduct, 
    handleAddProduct,
    addProduct,
    saveProduct, 
    deleteProduct, 
    handleCancelEdit,
    getShimmerWidth 
} from './components/product-list/productState';

export type { ProductState, ProductFormData } from './components/product-list/productState';


//  T Y P E S  ------------------------------------------------------------------- //

export * from './types';