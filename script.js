let allStoresData = []; // 將 allStoresData 宣告為空陣列，等待資料載入
const searchInput = document.getElementById("searchInput");
const cityFilter = document.getElementById("cityFilter");
const districtFilter = document.getElementById("districtFilter");
const storeTableBody = document.querySelector("#storeTable tbody");

/**
 * 渲染門市表格
 * @param {Array<Object>} stores - 要顯示的門市資料陣列
 */
function renderTable(stores) {
    storeTableBody.innerHTML = ""; // 清空現有行
    if (stores.length === 0) {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `<td colspan="3" style="text-align: center; color: #777;">沒有符合條件的門市。</td>`;
        storeTableBody.appendChild(noDataRow);
        return;
    }

    stores.forEach(store => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${store.name}</td>
            <td>${store.address}</td>
            <td>${store.tel}</td>
        `;
        storeTableBody.appendChild(row);
    });
}

/**
 * 根據篩選條件過濾門市資料
 */
function filterStores() {
    const searchValue = searchInput.value.toLowerCase();
    const selectedCity = cityFilter.value;
    const selectedDistrict = districtFilter.value;

    let filtered = allStoresData.filter(store => {
        const matchSearch = 
            store.name.toLowerCase().includes(searchValue) ||
            store.address.toLowerCase().includes(searchValue) ||
            store.tel.toLowerCase().includes(searchValue);
        
        const matchCity = selectedCity === "" || store.city === selectedCity;
        const matchDistrict = selectedDistrict === "" || store.district === selectedDistrict;

        return matchSearch && matchCity && matchDistrict;
    });
    renderTable(filtered);
}

/**
 * 更新縣市篩選下拉選單的選項
 */
function updateCityFilter() {
    const cities = new Set();
    allStoresData.forEach(store => {
        if (store.city) {
            cities.add(store.city);
        }
    });

    // 定義縣市的自訂排序順序 (從北到南、東部、離島)
    const customCityOrder = [
        "基隆市", "台北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣",
        "台中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "台南市",
        "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "金門縣" // 離島放在最後
    ];

    // 根據自訂順序排序縣市
    const sortedCities = Array.from(cities).sort((a, b) => {
        const indexA = customCityOrder.indexOf(a);
        const indexB = customCityOrder.indexOf(b);

        // 如果縣市不在 customCityOrder 中，則將其視為在列表的末尾
        const finalIndexA = indexA === -1 ? customCityOrder.length : indexA;
        const finalIndexB = indexB === -1 ? customCityOrder.length : indexB;

        return finalIndexA - finalIndexB;
    });

    cityFilter.innerHTML = '<option value="">所有縣市</option>'; // 重置縣市篩選
    sortedCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
    });
    // 重新選擇縣市後，更新區域篩選
    updateDistrictFilter(); 
}

/**
 * 更新區域篩選下拉選單的選項
 */
function updateDistrictFilter() {
    const selectedCity = cityFilter.value;
    districtFilter.innerHTML = '<option value="">所有區域</option>'; // 重置區域篩選
    districtFilter.style.display = 'none'; // 預設隱藏區域下拉選單

    if (selectedCity) {
        const districts = new Set();
        allStoresData.forEach(store => {
            if (store.city === selectedCity && store.district) {
                districts.add(store.district);
            }
        });

        // 將區域轉換為陣列並排序
        const sortedDistricts = Array.from(districts).sort((a, b) => a.localeCompare(b));

        if (sortedDistricts.length > 0) {
            sortedDistricts.forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                districtFilter.appendChild(option);
            });
            districtFilter.style.display = 'inline-block'; // 如果有區域則顯示下拉選單
        }
    }
    // 當縣市改變時，重置區域選擇為 "所有區域"
    districtFilter.value = "";
    filterStores(); // 縣市或區域改變後重新過濾
}

/**
 * 載入門市資料
 */
async function loadStoresData() {
    try {
        // 從 window.storesJsonUrl 全域變數獲取 JSON 檔案的 URL
        const response = await fetch(window.storesJsonUrl); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allStoresData = await response.json(); // 將載入的資料賦值給 allStoresData
        console.log('門市資料載入成功:', allStoresData.length, '筆資料');
    } catch (error) {
        console.error('載入門市資料失敗:', error);
        // 如果載入失敗，可以考慮提供一個預設的空資料或錯誤訊息
        allStoresData = []; 
        storeTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: red;">載入門市資料失敗，請檢查外部網址或檔案格式。</td></tr>`;
    } finally {
        // 無論成功或失敗，都執行初始渲染和篩選器更新
        updateCityFilter(); // 初始呼叫此函數以生成縣市選項
        filterStores(); // 初始渲染所有門市 (或顯示錯誤訊息)
    }
}

// 頁面載入時載入門市資料
// 確保在 DOM 元素可用後才添加事件監聽器，但 loadStoresData 可以在此時呼叫
loadStoresData();

// 事件監聽器
document.addEventListener('DOMContentLoaded', () => {
    searchInput.addEventListener("input", filterStores); // 搜尋輸入框變化時過濾
    cityFilter.addEventListener("change", updateDistrictFilter); // 縣市選擇變化時更新區域並過濾
    districtFilter.addEventListener("change", filterStores); // 區域選擇變化時過濾
});
