// lib/api.ts
import { toast } from 'sonner'

/** -------------------------
 *  Authentication Token Storage
 * ------------------------- */

const AUTH_TOKEN_KEY = 'auth_token';

/**
 * Validates JWT token format (header.payload.signature)
 */
function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

/**
 * Retrieves the authentication token from localStorage
 * @returns The JWT token or null if not found or invalid
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;
    
    // Validate token format before returning
    if (!isValidTokenFormat(token)) {
      console.warn('Invalid token format found in storage, clearing...');
      clearAuthToken();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error reading auth token from localStorage:', error);
    return null;
  }
}

/**
 * Stores the authentication token in localStorage
 * @param token - The JWT token to store
 * @throws Error if token format is invalid
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  
  if (!isValidTokenFormat(token)) {
    throw new Error('Invalid token format. Expected JWT format (header.payload.signature)');
  }
  
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing auth token in localStorage:', error);
    throw new Error('Failed to store authentication token');
  }
}

/**
 * Removes the authentication token from localStorage
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing auth token from localStorage:', error);
  }
}

/** -------------------------
 *  Authentication API Functions
 * ------------------------- */

/**
 * Authenticates a user with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns Object containing JWT token and user data
 * @throws Error if authentication fails
 */
export async function loginUser(email: string, password: string): Promise<{
  jwt: string;
  user: any;
}> {
  try {
    const response = await fetch('/api/strapi/auth/local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: email,
        password: password,
      }),
    });

    // Handle malformed responses
    if (!response.ok) {
      let errorMessage = 'Authentication failed';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData?.error?.message || errorData?.message || errorMessage;
        
        // Log error details for debugging (without sensitive data)
        console.error('Login failed:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
        });
      } catch (parseError) {
        // Response body is not valid JSON
        console.error('Login failed with malformed response:', {
          status: response.status,
          statusText: response.statusText,
        });
        errorMessage = `Authentication failed: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Parse successful response
    let data: { jwt: string; user: any };
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse login response:', parseError);
      throw new Error('Received malformed response from server');
    }

    // Validate response structure
    if (!data.jwt || !data.user) {
      console.error('Login response missing required fields:', {
        hasJwt: !!data.jwt,
        hasUser: !!data.user,
      });
      throw new Error('Invalid response format from authentication server');
    }
    
    // Store the JWT token
    setAuthToken(data.jwt);
    
    return data;
  } catch (error) {
    // Clear any existing token on login failure
    clearAuthToken();
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error during login:', error.message);
      throw new Error('Unable to connect to server. Please check your network connection.');
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Retrieves the currently authenticated user's information
 * @returns User object with profile data
 * @throws Error if not authenticated or request fails
 */
export async function getCurrentUser(): Promise<any> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Add populate parameter to include role information
    const response = await fetch('/api/strapi/users/me?populate=role', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle token expiration (401 Unauthorized)
    if (response.status === 401) {
      console.warn('Token expired or invalid, clearing session');
      clearAuthToken();
      throw new Error('Session expired. Please log in again.');
    }

    // Handle other error responses
    if (!response.ok) {
      let errorMessage = 'Failed to retrieve user information';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData?.error?.message || errorData?.message || errorMessage;
        
        // Log error details for debugging (without sensitive data)
        console.error('Get current user failed:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
        });
      } catch (parseError) {
        // Response body is not valid JSON
        console.error('Get current user failed with malformed response:', {
          status: response.status,
          statusText: response.statusText,
        });
      }
      
      clearAuthToken();
      throw new Error(errorMessage);
    }

    // Parse successful response
    let userData: any;
    try {
      userData = await response.json();
    } catch (parseError) {
      console.error('Failed to parse user data response:', parseError);
      clearAuthToken();
      throw new Error('Received malformed response from server');
    }

    // Validate response structure
    if (!userData || typeof userData !== 'object') {
      console.error('User data response has invalid structure');
      clearAuthToken();
      throw new Error('Invalid user data format received');
    }

    return userData;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error while fetching user data:', error.message);
      throw new Error('Unable to connect to server. Please check your network connection.');
    }
    
    // If we get a 401 or other auth error, clear the token
    clearAuthToken();
    throw error;
  }
}

/**
 * Logs out the current user by clearing the authentication token
 */
export function logoutUser(): void {
  clearAuthToken();
}

/** -------------------------
 *  Utilities
 * ------------------------- */

/**
 * Authenticated fetch wrapper that automatically adds Authorization header
 * and handles 401 responses with session refresh
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Response object
 */
export async function authenticatedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const token = getAuthToken();
  
  // Prepare headers with Authorization if token exists
  const headers = new Headers(options?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Merge headers back into options
  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle 401 Unauthorized by attempting session refresh
    if (response.status === 401) {
      console.warn('Received 401 Unauthorized response, token may be expired');
      
      // Don't attempt refresh for auth endpoints to avoid infinite loops
      const isAuthEndpoint = url.includes('/auth/local') || url.includes('/users/me');
      
      if (!isAuthEndpoint && token) {
        try {
          // Attempt to refresh session by verifying token with /users/me
          const refreshResponse = await fetch('/api/strapi/users/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (refreshResponse.ok) {
            // Session is still valid, retry the original request
            console.log('Session refresh successful, retrying original request');
            const retryResponse = await fetch(url, fetchOptions);
            return retryResponse;
          } else {
            // Session refresh failed, clear token and log out
            console.warn('Session refresh failed, token expired');
            clearAuthToken();
          }
        } catch (refreshError) {
          // Session refresh failed due to network error, clear token
          console.error('Session refresh error:', refreshError instanceof Error ? refreshError.message : 'Unknown error');
          clearAuthToken();
        }
      } else {
        // Auth endpoint or no token, just clear token
        clearAuthToken();
      }
      
      // Note: We don't redirect here to avoid circular dependencies
      // The AuthProvider will handle the redirect when it detects no token
    }
    
    return response;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error in authenticatedFetch:', {
        url,
        message: error.message,
      });
      throw new Error('Network error: Unable to connect to server');
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Wrapper for fetch with retry logic for network errors
 */
async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries = 3
): Promise<Response> {
  let lastError: Error | null = null
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      return response
    } catch (error) {
      lastError = error as Error
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn(`Network error, retry ${i + 1}/${retries}:`, error)
        
        // Show toast on first network error
        if (i === 0) {
          toast.warning('Network Issue', {
            description: 'Connection problem detected. Retrying...',
            duration: 3000,
          })
        }
        
        // Wait before retrying (exponential backoff)
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        }
      } else {
        // Non-network error, don't retry
        throw error
      }
    }
  }
  
  // All retries failed
  console.error('All retry attempts failed:', lastError)
  toast.error('Network Error', {
    description: 'Unable to connect to the server. Please check your connection.',
    duration: 5000,
  })
  
  throw lastError || new Error('Network request failed')
}

async function asJson<T>(r: Response): Promise<T> {
  if (!r.ok) {
    let errorMessage = 'An error occurred'
    
    try {
      const errorText = await r.text()
      
      // Try to parse as JSON
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error?.message || errorJson.message || errorText
      } catch (jsonError) {
        // Not valid JSON, use text as error message
        errorMessage = errorText || `Request failed with status ${r.status}`
      }
    } catch (textError) {
      // Failed to read response body
      console.error('Failed to read error response body:', textError)
      errorMessage = `Request failed with status ${r.status}`
    }
    
    // Log error to console for debugging (without sensitive data)
    console.error('API Error:', {
      status: r.status,
      statusText: r.statusText,
      url: r.url,
      message: errorMessage
    })
    
    // Show error toast notification
    toast.error('Request Failed', {
      description: errorMessage,
      duration: 5000,
    })
    
    throw new Error(errorMessage)
  }
  
  // Parse successful response
  try {
    return await r.json()
  } catch (parseError) {
    console.error('Failed to parse JSON response:', {
      url: r.url,
      status: r.status,
      error: parseError instanceof Error ? parseError.message : 'Unknown error'
    })
    throw new Error('Received malformed response from server')
  }
}

async function asMaybeJson<T>(r: Response): Promise<T | null> {
  if (r.status === 204 || r.status === 304) return null;
  return asJson<T>(r);
}

function qs(params: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.append(k, String(v));
  }
  return sp.toString();
}

function unwrapOne<T = any>(row: any): T | null {
  if (!row) return null as any;
  const data = row.data ?? row;
  
  // Extract both id and documentId
  const id = data.id ?? data.attributes?.id;
  const documentId = data.documentId ?? data.attributes?.documentId;
  
  const attrs = data.attributes ?? data;
  
  // Return with both id and documentId preserved
  return { 
    id: id ?? documentId, // Fallback to documentId if id is missing
    documentId: documentId ?? id, // Fallback to id if documentId is missing
    ...attrs 
  } as T;
}

function unwrapMany<T = any>(res: any): { items: T[]; total: number; raw: any } {
  if (!res) return { items: [], total: 0, raw: res };
  const arr = Array.isArray(res.data) ? res.data : res;
  const items = (Array.isArray(arr) ? arr : [])
    .map((row) => unwrapOne<T>(row))
    .filter(Boolean) as T[];
  const total = res?.meta?.pagination?.total ?? items.length ?? 0;
  return { items, total, raw: res };
}

function normalizeOrder(order: any) {
  if (!order) return order;
  const o = unwrapOne<any>(order);
  
  // Normalize status field - set both status and orderStatus for compatibility
  const statusValue = o.orderStatus ?? o.status;
  o.status = statusValue;
  o.orderStatus = statusValue;
  
  // Create customer object from flat fields if it doesn't exist
  if (!o.customer && (o.customer_name || o.customer_phone || o.address)) {
    o.customer = {
      id: o.id, // Use order id as fallback
      name: o.customer_name || 'N/A',
      email: '', // Not available in order data
      phone: o.customer_phone,
      address: o.address,
    };
  }
  
  // Generate orderNumber if it doesn't exist
  if (!o.orderNumber && o.id) {
    o.orderNumber = `#${String(o.id).padStart(5, '0')}`;
  }
  
  // Normalize items
  if (o.items && Array.isArray(o.items)) {
    o.items = o.items.map((it: any) => unwrapOne(it));
    o.items = o.items.map((it: any) => ({ ...it, product: unwrapOne(it?.product) }));
  }
  
  return o;
}

async function fetchProductsByIds(ids: number[]) {
  const params = new URLSearchParams();
  ids.forEach((id, i) => params.append(`filters[id][$in][${i}]`, String(id)));
  params.set("pagination[pageSize]", String(Math.max(100, ids.length)));
  const r = await authenticatedFetch(`/api/strapi/products?${params.toString()}`, { cache: "no-store" });
  const json = await asJson<any>(r);
  const map = new Map<number, number>(); // id -> price
  for (const row of json?.data ?? []) {
    const id = row?.id ?? row?.documentId;
    const price = Number(row?.attributes?.price ?? row?.price);
    if (Number.isFinite(Number(id))) map.set(Number(id), price);
  }
  return map;
}

function isNumericId(v: string | number) {
  if (typeof v === "number") return Number.isFinite(v);
  return /^\d+$/.test(v);
}


export async function createOrder(data: {
  customer_name: string;
  customer_phone?: string;
  address?: string;
  orderStatus?: string;
}) {
  const r = await authenticatedFetch(`/api/strapi/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  const json = await asJson<any>(r);
  return unwrapOne(json); // will include both id and documentId (flattened by unwrapOne)
}


/** =========================
 *   PRODUCTS (CRUD)
 * ========================= */
export async function listProducts({
  page = 1,
  pageSize = 20,
  search,
  active,
  sort = "createdAt:desc",
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  sort?: string;
}) {
  const params: Record<string, any> = {
    "pagination[page]": page,
    "pagination[pageSize]": pageSize,
    sort,
  };
  if (search) {
    params["filters[$or][0][name][$containsi]"] = search;
    params["filters[$or][1][sku][$containsi]"] = search;
  }
  if (active !== undefined) {
    params["filters[is_active][$eq]"] = active ? "true" : "false";
  }
  const r = await authenticatedFetch(`/api/strapi/products?${qs(params)}`, { cache: "no-store" });
  const json = await asJson<any>(r);
  const { items, total } = unwrapMany(json);
  return { products: items, total };
}

export async function getProduct(id: number | string){ 
  const r = await authenticatedFetch(`/api/strapi/products/${id}`, { cache: "no-store" });
  const json = await asJson<any>(r);
  return unwrapOne(json);
}

export async function createProduct(payload: {
  sku: string;
  name: string;
  price: number;
  stock?: number;
}) {
  const r = await authenticatedFetch(`/api/strapi/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: payload }),
  });
  const json = await asJson<any>(r);
  return unwrapOne(json);
}

export async function updateProduct(
  id: number | string ,
  data: Partial<{ sku: string; name: string; price: number; stock: number; }>
) {
  const r = await authenticatedFetch(`/api/strapi/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  const json = await asJson<any>(r);
  return unwrapOne(json);
}

export async function deleteProduct(id: number | string) {
  const r = await authenticatedFetch(`/api/strapi/products/${id}`, { method: "DELETE" });
  return asMaybeJson<any>(r); // <-- changed
}

/** =========================
 *   ORDERS (CRUD)
 * ========================= */
export async function listOrders({
  page = 1,
  pageSize = 10,
  search,
  orderStatus,
  sort = "createdAt:desc",
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  orderStatus?: string;
  sort?: string;
}) {
  const params: Record<string, any> = {
    "populate[items][populate]": "product",
    "pagination[page]": page,
    "pagination[pageSize]": pageSize,
    sort,
  };
  if (search) {
    params["filters[$or][0][customer_name][$containsi]"] = search;
    params["filters[$or][1][address][$containsi]"] = search;
    params["filters[$or][2][customer_phone][$containsi]"] = search;
  }
  if (orderStatus) {
    params["filters[orderStatus][$eq]"] = orderStatus;
  }
  const r = await authenticatedFetch(`/api/strapi/orders?${qs(params)}`, { cache: "no-store" });
  const json = await asJson<any>(r);
  const { items, total } = unwrapMany(json);
  return { orders: items.map(normalizeOrder), total };
}

export async function getOrderById(id: number | string) {
  // Try direct fetch first (works for both numeric ID and documentId in Strapi v5)
  const r = await authenticatedFetch(
    `/api/strapi/orders/${id}?${qs({ "populate[items][populate]": "product" })}`,
    { cache: "no-store" }
  );
  
  // If successful, return normalized order
  if (r.ok) {
    const json = await asJson<any>(r);
    return normalizeOrder(json);
  }
  
  // If failed and looks like a documentId (not numeric), try filter approach
  if (!/^\d+$/.test(String(id))) {
    const params = {
      "filters[documentId][$eq]": String(id),
      "populate[items][populate]": "product",
      "pagination[pageSize]": 1,
    };
    const r2 = await authenticatedFetch(`/api/strapi/orders?${qs(params)}`, { cache: "no-store" });
    const json2 = await asJson<any>(r2);
    const first = json2?.data?.[0];
    return normalizeOrder(first);
  }
  
  // If all else fails, throw the original error
  const json = await asJson<any>(r);
  return normalizeOrder(json);
}

export async function getOrderByDocumentId(documentId: string | number) {
  const params = {
    "filters[documentId][$eq]": String(documentId),
    "populate[items][populate]": "product",
    "pagination[pageSize]": 1,
  };
  const r = await authenticatedFetch(`/api/strapi/orders?${qs(params)}`, { cache: "no-store" });
  const json = await asJson<any>(r);
  const first = json?.data?.[0];
  return normalizeOrder(first);
}

export async function updateOrder(
  id: number | string,
  data: Partial<{
    customer_name: string;
    customer_phone?: string;
    address?: string;
    orderStatus?: string;
    total_price?: number;
  }>
) {
  const r = await authenticatedFetch(`/api/strapi/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  const json = await asJson<any>(r);
  return unwrapOne(json);
}

export async function deleteOrder(id: number | string) {
  const r = await authenticatedFetch(`/api/strapi/orders/${id}`, { method: "DELETE" });
  return asMaybeJson<any>(r); // <-- changed
}

/** =========================================
 *   ORDER-ITEMS (CRUD + list by order)
 * ========================================= */
export async function createOrderItem(data: {
  order: number;     // order DB id
  product: number;   // product DB id
  quantity: number;
  unit_price?: number;
}) {
  const r = await authenticatedFetch(`/api/strapi/order-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  const json = await asJson<any>(r);
  return unwrapOne(json);
}

export async function updateOrderItem(
  id: number | string,
  data: Partial<{ order: number; product: number; quantity: number; unit_price: number }>
) {
  const r = await authenticatedFetch(`/api/strapi/order-items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  const json = await asJson<any>(r);
  return unwrapOne(json);
}

export async function deleteOrderItem(id: number | string) {
  const r = await authenticatedFetch(`/api/strapi/order-items/${id}`, { method: "DELETE" });
  return asMaybeJson<any>(r); // <-- changed
}

export async function listOrderItemsByOrder(orderId: number | string) {
  const params = {
    "filters[order][id][$eq]": String(orderId),
    populate: "product",
    "pagination[pageSize]": 1000,
  };
  const r = await authenticatedFetch(`/api/strapi/order-items?${qs(params)}`, { cache: "no-store" });
  const json = await asJson<any>(r);
  const { items } = unwrapMany(json);
  return items.map((it: any) => ({ ...it, product: unwrapOne(it?.product) }));
}

/** ---------------------------------------------------------
 *   High-level helper: create order + its items (default ctrl)
 * --------------------------------------------------------- */
export type CreateOrderPayload = {
  customer_name: string;
  customer_phone?: string;
  address?: string;
  orderStatus?: string; // e.g., 'en_preparation'
  lines: { product: number; quantity: number; unit_price?: number }[];
};


export async function getOrderDetail(idOrDoc: string | number) {
  if (isNumericId(idOrDoc)) {
    // numeric DB id path + populate
    const r = await authenticatedFetch(
      `/api/strapi/orders/${idOrDoc}?populate[items][populate]=product`,
      { cache: "no-store" }
    );
    const json = await asJson<any>(r);
    return normalizeOrder(json);
  } else {
    // documentId via filter
    const params = new URLSearchParams();
    params.set("filters[documentId][$eq]", String(idOrDoc));
    params.set("populate[items][populate]", "product");
    params.set("pagination[pageSize]", "1");

    const r = await authenticatedFetch(`/api/strapi/orders?${params.toString()}`, {
      cache: "no-store",
    });
    const json = await asJson<any>(r);
    const row = json?.data?.[0];
    return normalizeOrder(row);
  }
}



// when you finish creating items, prefer redirecting with documentId
export async function createOrderWithItems(payload: {
  customer_name: string;
  customer_phone?: string;
  address?: string;
  orderStatus?: string;
  lines: { product: number; quantity: number; unit_price?: number }[];
}) {
  // 1) create order
  const r = await authenticatedFetch(`/api/strapi/orders/place`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        address: payload.address,
        orderStatus: payload.orderStatus,
      }
    }),
  });
  const created = await asJson<any>(r);
  const newId = created?.data?.id ?? created?.id;
  const newDoc = created?.data?.documentId ?? created?.documentId;
  if (!Number.isFinite(newId)) throw new Error("Order created but no numeric id returned");

  // 2) create items
  const cleanLines = (payload.lines ?? []).filter(l => l.product && l.quantity > 0);
  await Promise.all(
    cleanLines.map(async (l) => {
      const rr = await authenticatedFetch(`/api/strapi/order-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            order: Number(newId),
            product: Number(l.product),
            quantity: Number(l.quantity),
            unit_price: Number(l.unit_price),
          }
        }),
      });
      const jj = await rr.json();
      if (!rr.ok) throw new Error(JSON.stringify(jj));
    })
  );

  // 3) fetch populated order
  const params = new URLSearchParams();
  params.set("populate[items][populate]", "product");
  const r2 = await authenticatedFetch(`/api/strapi/orders/${newDoc}?${params.toString()}`, { cache: "no-store" });
  const finalJson = await asJson<any>(r2);

  // 4) normalize and ALWAYS include both id and documentId
  const row = finalJson?.data ?? finalJson; // handle both shapes
  const normalized = {
    // Strapi v5 usually returns these at top-level in .data
    id: row?.id ?? newId,
    documentId: row?.documentId ?? newDoc,
    ...row,
  };

  return normalized;
}

// --- EDIT ORDER HELPERS ---

type EditLine = { product: number; quantity: number; unit_price?: number };

export async function getOrderForEdit(idOrDoc: string) {
  const paramsDoc = new URLSearchParams();
  paramsDoc.set("populate[items][populate]", "product");

  // Try by documentId (direct GET /:id)
  const rDoc = await authenticatedFetch(`/api/strapi/orders/${idOrDoc}?${paramsDoc}`, { cache: "no-store" });
  if (rDoc.ok) return rDoc.json();

  // Fallback: search by documentId and pick first
  const p = new URLSearchParams();
  p.set("filters[documentId][$eq]", idOrDoc);
  p.set("populate[items][populate]", "product");
  p.set("pagination[pageSize]", "1");
  const r = await authenticatedFetch(`/api/strapi/orders?${p}`, { cache: "no-store" });
  const j = await r.json();
  if (!r.ok || !j?.data?.[0]) throw new Error("Order not found");
  return { data: j.data[0] };
}

export async function updateOrderBasics(
  idOrDoc: string,
  data: {
    customer_name?: string;
    customer_phone?: string;
    address?: string;
    orderStatus?: string;
    total_price?: number;
  }
) {
  // resolve documentId -> numeric id
  const { id } = await resolveOrderId(idOrDoc);
  const r = await authenticatedFetch(`/api/strapi/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  return asJson<any>(r);
}

async function resolveOrderId(idOrDoc: string): Promise<{ id: number; documentId?: string }> {
  // numeric id?
  if (/^\d+$/.test(idOrDoc)) {
    return { id: Number(idOrDoc) };
  }
  // documentId lookup
  const p = new URLSearchParams();
  p.set("filters[documentId][$eq]", idOrDoc);
  p.set("pagination[pageSize]", "1");

  const r = await authenticatedFetch(`/api/strapi/orders?${p.toString()}`, { cache: "no-store" });
  const j = await asJson<any>(r);
  const row = j?.data?.[0];
  if (!row) throw new Error("Order not found");
  return { id: row.id, documentId: row.documentId };
}

export async function listOrderItems(orderId: number) {
  const params = new URLSearchParams();
  params.set("filters[order][id][$eq]", String(orderId));
  params.set("pagination[pageSize]", "200");
  const r = await authenticatedFetch(`/api/strapi/order-items?${params}`, { cache: "no-store" });
  const json = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(json));
  return json?.data ?? [];
}


export async function replaceOrderItems(orderId: number, lines: EditLine[]) {
  // delete existing
  const existing = await listOrderItems(orderId);
  await Promise.all(existing.map((it: any) => deleteOrderItem(it.id)));

  // re-create
  const clean = (lines ?? []).filter(l => l.product && l.quantity > 0);
  await Promise.all(
    clean.map(l =>
      createOrderItem({
        order: orderId,
        product: Number(l.product),
        quantity: Number(l.quantity),
        unit_price: l.unit_price !== undefined ? Number(l.unit_price) : undefined,
      })
    )
  );
}

export async function updateOrderWithItems(
  documentId: string, // pass the documentId here
  payload: {
    customer_name?: string;
    customer_phone?: string;
    address?: string;
    orderStatus?: string;
    lines: EditLine[];
  }
) {
  // Build the backend payload: { data: {…basics}, lines: [...] }
  const { lines = [], ...basics } = payload;
  const r = await authenticatedFetch(`/api/strapi/orders/by-document/${documentId}/replace`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: basics,    // handled in the controller as base order fields
      lines,           // controller replaces items, recalculates total in a trx
    }),
  });
  const json = await asJson<any>(r);

  // The controller returns the populated order. Normalize a bit for FE:
  const row = json?.data ?? json;
  return {
    id: row?.id,
    documentId: row?.documentId ?? documentId,
    ...row,
  };
}



/** =========================
 *   USERS
 * ========================= */
export async function getUsers({
  page = 1,
  pageSize = 20,
  search,
  role,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
} = {}) {
  const params: Record<string, any> = {
    "pagination[page]": page,
    "pagination[pageSize]": pageSize,
  };
  if (search) {
    params["filters[$or][0][username][$containsi]"] = search;
    params["filters[$or][1][email][$containsi]"] = search;
  }
  if (role) {
    params["filters[role][name][$eq]"] = role;
  }
  const r = await authenticatedFetch(`/api/strapi/users?${qs(params)}`, { cache: "no-store" });
  const json = await asJson<any>(r);
  const { items, total } = unwrapMany(json);
  return { users: items, total };
}

/** =========================
 *   ANALYTICS
 * ========================= */
export async function getAnalytics(range = 30) {
  const r = await authenticatedFetch(`/api/strapi/analytic/summary?${qs({ range })}`, {
    cache: "no-store",
  });
  return asJson<any>(r);
}

export async function getKPIData(range = 30) {
  const data = await getAnalytics(range);
  const kpis = data?.kpis ?? data; // Support both nested and flat structure
  return {
    revenueToday: kpis?.revenueToday ?? 0,
    revenue7d: kpis?.revenue7d ?? 0,
    revenue30d: kpis?.revenue30d ?? 0,
    ordersToday: kpis?.ordersToday ?? 0,
    orders7d: kpis?.orders7d ?? 0,
    orders30d: kpis?.orders30d ?? 0,
  };
}

export async function getRevenueChartData(range = 30) {
  const data = await getAnalytics(range);
  return Array.isArray(data?.revenueByDay) ? data.revenueByDay : [];
}

export async function getOrderStatusChartData(range = 30) {
  const data = await getAnalytics(range);
  return Array.isArray(data?.ordersByStatus) ? data.ordersByStatus : [];
}

