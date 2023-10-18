/**
* Testing
* Ultimate List Sections
* Copyright Will-Myers.com
*/


class SummaryListSections{
  constructor(section) {
    this.section = section;
    this.titleEl = this.section.querySelector('.list-section-title');
    this.titleStr = this.titleEl.innerText;
    this.collectionUrl = this.titleStr.match(/\{(.*?)\}/)[1];
    this.collectionData = [];
    this.sectionItems = this.section.querySelectorAll('li.list-item');
    this.listSectionContainer = this.section.querySelector('.user-items-list-item-container')
    this.currentContext = JSON.parse(this.listSectionContainer.dataset.currentContext);

    this.init();
  }

  async init() {
    this.section.dataset.mappingStatus = 'mapping';
    this.collectionData = await this.getCollectionData();
    this.adjustTitle();
    
    if (this.sectionItems.length > this.collectionData.length) {
      console.error('Not Enough Collection Items')
      this.section.dataset.mappingStatus = 'complete'
      return;
    }
    this.mapCollectionDataToListItems(); 
    this.addLoadEventListeners();
    this.addResizeEvent();
  }

  async getCollectionData() {
    try {
      const date = new Date().getTime();
      const response =  await fetch(`${this.collectionUrl}?format=json&date=${date}`);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
        this.section.dataset.mappingStatus = 'complete'
      }
      const data = await response.json();
      const items = data.items;
      if (!items) {
        throw new Error(`No items in the collection`);
        this.section.dataset.mappingStatus = 'complete'
      }
      return items; // Return the data so it can be used after await
    } catch (error) {
      console.error('Error fetching data:', error);
      this.section.dataset.mappingStatus = 'complete'
      throw error;
    }
  }

  adjustTitle() {
    let url = this.titleStr.match(/\{(.*?)\}/)[0];
    console.log(this.titleStr.match(/\{(.*?)\}/));
    let newTitleHTML = this.titleEl.innerHTML.replaceAll(url, '');
    this.titleEl.innerHTML = newTitleHTML;
    if (this.titleEl.innerText.trim() == '') this.titleEl.remove();
  }

  mapCollectionDataToListItems() {
    const currentContext = this.currentContext;
    for (let [index, listItem] of this.sectionItems.entries()) {
      const contextItem = this.currentContext.userItems[index];
      const { 
        title, 
        assetUrl, 
        body, 
        excerpt, 
        fullUrl, 
        sourceUrl, 
        passthrough 
      } = this.collectionData[index];
      let titleEl = listItem.querySelector('.list-item-content__title');
      let descriptionEl = listItem.querySelector('.list-item-content__description');
      let thumbnailEl = listItem.querySelector('img');
      let buttonEl = listItem.querySelector('a.list-item-content__button');
      
      if (titleEl) {
        titleEl.innerText = title;
        contextItem.title = title;
      }
      if (descriptionEl) {
        descriptionEl.innerHTML = excerpt;
        contextItem.description = excerpt;
      }
      if (thumbnailEl) {
        thumbnailEl.src = assetUrl;
        if (contextItem.image) contextItem.image.assetUrl = assetUrl
        if (contextItem.image) contextItem.imageId = index
      }
      if (buttonEl) {
        buttonEl.setAttribute('href', fullUrl)
        if (contextItem.button) contextItem.button.buttonLink = fullUrl;
      }
      
    }
    const updatedDataStr = JSON.stringify(this.currentContext);
    this.listSectionContainer.dataset.currentContext = updatedDataStr;
    this.section.dataset.mappingStatus = 'complete'
  }

  addLoadEventListeners() {
    window.addEventListener('DOMContentLoaded', () => {
      this.mapCollectionDataToListItems(); 
    })
    window.addEventListener('load', () => {
      this.mapCollectionDataToListItems(); 
    })
  }

  addResizeEvent() {
    let resizeTimeout;
    window.addEventListener('resize', () =>  {
        this.section.dataset.mappingStatus = 'mapping'
        clearTimeout(resizeTimeout); // Clear the timeout
    
        // Set a new timeout
        resizeTimeout = setTimeout(() => {
            this.mapCollectionDataToListItems()
        }, 300); 
    });
  }
}

const WMSummaryListSections = document.querySelectorAll('.list-section-title');
for (let el of WMSummaryListSections) {
  const section = el.closest('.page-section');
  const text = el.innerText;
  if (text.includes("{") && text.includes("}")) {
    section.WMSummaryList = new SummaryListSections(section)
  }
}