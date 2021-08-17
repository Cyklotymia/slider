class MainSlider {


    constructor(rootClass) {

        /// zmienne HTML stałe

        // sekcja ograniczająca widoczność slidera (overflow : hidden)
        this.section = document.querySelector(`.${rootClass}`);
        // kontener zawierający slidy
        this.slider = this.section.querySelector(".js__MainSlider");
        // pobrane elementy slidera zgodnie z HTML
        this.startingSliderElements = this.section.querySelectorAll(".js__MainSlider-element");
        // elementy slidera które będą póżniej zmieniane ( append, prepend )
        this.sliderElements = this.section.querySelectorAll(".js__MainSlider-element");

        /// zmienne zdeklarowane ustalajace czy dany element wystepuje w sliderze
        // czas intervalu
        this.intervalTime = null; 
        // występowanie strzałki w lewo
        this.arrowLeft = null;
        // występowanie strzałki w prawo
        this.arrowRight = null; 
        // występowanie nawigacji slidera
        this.controlPanel = null;
        // rodzaj animacji dla slidera
        this.animation = null; 
        

        /// ukrywanie obiektów podczas braku eventów wjazdu myszki na slider

        //strzałka w lewo
        this.isHiddenLeft = null;
        //strzałka w prawo
        this.isHiddenRight = null; 
        
        /// zmienne generujące się na podstawie ilości slidów

        // kontrolki do navigacji
        this.controlPanelElements = null; 
        // ilość widocznych elementów  w jednym slidzie
        this.amountOfVisibleElements = null;
        // szerokość kontenera z overflow, czyli ograniczającego widocznośc slidów
        this.widthOfVisibleElement = null;

        /// zmienne do których musi mieć dostęp wiele funkcji
        // index wyświetlanego slidera
        this.indexOfShowedSlider = null; 
        // cały interval dla slidera
        this.intervalForSlider = null;
        // czas animacji (mnożony razy 1000)
        this.transition = 1
        // index poprzednio kliknietego elementu nawigacji
        this.indexOfLastActiveDot = 0
        // ostatni index aktywnego slidera
        this.remaindMeLastIndex = this.indexOfShowedSlider 
        // elementy które muszą pozostać skopiowane i wrzucone jako prepend/append
        this.elementsToCopy = []
 

        /// flagi

        // czy index został zmieniony przez użytkownika?
        this.indexManualyChanged = false 
       // czy uzytkownik moze ponownie kliknąc w strzałkę ( interval ograniczający bugowanie)
        this.canIClick = true 
        // czy została kliknieta ostatni element nawigacji
        this.lastElementWasClicked = false
        // czy nawigacja zostala kliknieta
        this.dotClicked = false

        this.mediaQueryList = window.matchMedia("(orientation: portrait)");
       
     
        /// poczatkowe funcje inicjalizujace slider

        // pobranie indexu rozpoczynającego ( szuka pierwszego elementu z active)
        this.readIndex(); 
        // ustala początkowe zmienne ( pobierane na podstawie klas / datyset z HTML)
        this.getVariables();
        // dodaje date index w zależnosci od indexu slidera
        this.addDatasetForSliders()
        // rozpoczyna działanie slidera
        this.initSlider();
        this.mediaQuery()



    }

    //////////// METODY STARTOWE

    //// metoda czytająca rozpoczynający index
    readIndex = () => {
        this.sliderElements.forEach((sliderElement, index) => {
            if (sliderElement.classList.contains("active")) {
                this.indexOfShowedSlider = index;
            };
        });
    };

    /// metoda pobierająca początkowe zmienne  
    getVariables = () => {
        this.intervalTime = this.slider.dataset.interval ?? null;
        this.arrowLeft = this.section.querySelector(`.js__MainSlider-arrow--left`) ?? null;
        this.arrowRight = this.section.querySelector(`.js__MainSlider-arrow--right`) ?? null;
        this.controlPanel = this.section.querySelector(`.js__MainSlider-controler`) ?? null;
        this.isHiddenLeft = this.arrowLeft.classList.contains("js__MainSlider-hidden") ?? null;
        this.isHiddenRight = this.arrowRight.classList.contains("js__MainSlider-hidden") ?? null;
        this.isHiddenControler = this.controlPanel.classList.contains("js__MainSlider-hidden") ?? null;
        this.touches = this.slider.dataset.mobile ?? null;
        this.animation = this.slider.dataset.animate ?? null;
        this.widthOfVisibleElement = this.slider.offsetWidth;
        this.heightOfVisibleElement = this.section.offsetHeight;
    };

    mediaQuery= ()=>{
        if (this.mediaQueryList.matches) {
           console.log('portrait');
          } else {
          console.log('landscape');
          }
        // console.log(this.mediaQueryList);

        this.mediaQueryList.addEventListener('change',()=>{
            this.resetSlider()
    
        })
    }
    //// metoda dodająca każdemu sliderowi date index
    addDatasetForSliders = () => {
        this.sliderElements.forEach((sliderElement, index) => {
            sliderElement.dataset.index = index;
        });
    };

    resetSlider= ()=>{
        clearInterval(this.intervalForSlider);
        this.resetContainer()
        this.readWidthOfVisibleElement()
        this.checkAmountOfElements()
        this.removeActiveForAnItems(this.sliderElements)
        this.addActiveForAnItem(this.sliderElements[0])
        this.addTransition(true)
        this.slider.style.transform = `translateX(0px)`

        this.controlPanel.innerHTML=""
        this.createControlPanel(this.amountOfVisibleElements)
        this.removeActiveForAnItems(this.controlPanelElements)
        this.addActiveForAnItem(this.controlPanelElements[0])

        this.indexOfShowedSlider=0
        this.indexOfLastActiveDot=0
        this.remaindMeLastIndex=0
       this.lastElementWasClicked=false
        this.sliderElements=this.section.querySelectorAll(".js__MainSlider-element");
       this.addDatasetForSliders()
       this.groupSliderElements()

    }
    //// metoda odpalająca funkcje zgodnie z wyzej ustalonymi zmiennymi
    initSlider = () => {
    
        if (this.controlPanel) {
            this.checkAmountOfElements();
            this.createControlPanel(this.amountOfVisibleElements)
            this.groupSliderElements();
          
            this.addStartedActive();
        };
        if (this.arrowLeft) {
            this.arrowLeft.addEventListener("click", () => {
                this.indexManualyChanged = true;
                clearInterval(this.intervalForSlider);
                if (this.animation === "fade") {
                    this.reduceIndex();
                    this.reduceDotIndex();
                }
                if (this.animation === "horizontal") {
                    if (this.canIClick) {
                        this.canIClick = false
                        this.moveIntoPrevSlide()
                        this.readyToClick()
                        if (this.sliderElements.length % this.amountOfVisibleElements) {
                            this.removeActiveForAnItems(this.controlPanelElements);
                        };
                    };
                };
                if (this.animation === "vertical") {
                    if (this.canIClick) {
                        this.canIClick = false
                        this.moveIntoPrevSlide()
                        this.readyToClick()
                        if (this.sliderElements.length % this.amountOfVisibleElements) {
                            this.removeActiveForAnItems(this.controlPanelElements)
                        }
                    }
                }

            });
        }
        if (this.arrowRight) {
            this.arrowRight.addEventListener("click", () => {
                this.indexManualyChanged = true
                clearInterval(this.intervalForSlider)
                if (this.animation === "fade") {
                    this.increaseIndex()
                }
                if (this.animation === "horizontal") {
                    if (this.canIClick) {
                        this.canIClick = false
                        this.moveIntoNextSlide()
                        this.readyToClick()
                        if (this.sliderElements.length % this.amountOfVisibleElements) {
                            this.removeActiveForAnItems(this.controlPanelElements)
                        }
                    }
                }
                if (this.animation === "vertical") {
                    if (this.canIClick) {
                        this.canIClick = false
                        this.moveIntoNextSlide()
                        this.readyToClick()
                        if (this.sliderElements.length % this.amountOfVisibleElements) {
                            this.removeActiveForAnItems(this.controlPanelElements)
                        }
                    }
                }
            })
        }
        if (this.isHiddenRight) {
            this.hiddenControl(this.arrowRight)
        }
        if (this.isHiddenLeft) {
            this.hiddenControl(this.arrowLeft)
        }
        if (this.isHiddenControler) {
            this.hiddenControl(this.controlPanel)
        }
        if (this.intervalTime) {
            this.setInterval()
            this.intervalControl()
        }
        if (this.touches) {
            this.controlTouches()
        }
        if (this.animation === "horizontal") {
            this.readWidthOfVisibleElement()
            this.addStartedActive();
        }
        if (this.animation === "vertical") {
            this.readHeightOfVisibleElement()
            this.addStartedActive();
        }
    }

    //// metoda dodająca active do elementu nawigacji
    addStartedActive = () => {
        this.controlPanelElements[this.indexOfShowedSlider].classList.add("active");
    }
    
    //// metoda która grupuje elementy slidera (data-group)
    groupSliderElements = () => {
        let numberOfGroup = 0;
        let increase = 0;
        this.sliderElements.forEach((sliderElement, index) => {
            if (increase >= this.amountOfVisibleElements) {
                numberOfGroup += 1;
                increase = 0;
            }
            increase++;
            this.sliderElements[index].dataset.group = numberOfGroup;
        });
    }
    //////////// METODY KONTROLUJACE DZIALANIE DANEGO OBIEKTU
    
    
    hiddenControl = (elementToHide) => {
        this.section.addEventListener("mouseleave", (e) => {
            elementToHide.classList.remove("active") 
        })
        this.section.addEventListener("mouseenter", (e) => {
            elementToHide.classList.add("active")       
        })
    }
    intervalControl = () => {
        this.section.addEventListener("mouseleave", (e) => {
            this.setInterval();  
        })
        this.section.addEventListener("mouseenter", (e) => {
            clearInterval(this.intervalForSlider);
        })
    }
    controlTouches = () => {
        let touchStart = null;
        let touchEnd = null;
        this.slider.addEventListener("touchstart", (e) => {
            clearInterval(this.intervalForSlider)
            this.indexManualyChanged = true
            touchStart = e.touches[0].clientX
        })
        this.slider.addEventListener("touchend", (e) => {
            if (e.target.closest(".js__MainSlider-arrow--right") || e.target.closest(".js__MainSlider-arrow--left") || e.target.closest(".js__MainSlider-control-element")) {
                clearInterval(this.intervalForSlider)
                return
            }
            clearInterval(this.intervalForSlider)
            if (this.animation === "fade") {
                if (touchStart > touchEnd) {
                    this.increaseIndex()
                } else {
                    this.reduceIndex();
                    this.reduceDotIndex()
                }
            }
            if (this.animation === "horizontal" || this.animation === "vertical") {
                this.indexManualyChanged = true
                clearInterval(this.intervalForSlider)
                if (touchStart > touchEnd) {
                    if (this.canIClick) {
                        this.canIClick = false
                        this.moveIntoNextSlide()
                        this.readyToClick()
                        if (this.sliderElements.length % this.amountOfVisibleElements) {
                            this.removeActiveForAnItems(this.controlPanelElements)
                        }
                    }

                } else {
                    if (this.canIClick) {
                        this.canIClick = false
                        this.moveIntoPrevSlide()
                        this.readyToClick()
                        if (this.sliderElements.length % this.amountOfVisibleElements) {
                            this.removeActiveForAnItems(this.controlPanelElements)
                        }
                    }
                }
            }
            this.setInterval()  
        })
        this.slider.addEventListener("touchmove", (e) => {
            touchEnd = e.touches[0].clientX
        })
    }
    
    
    ////////// METODY ZMIENIAJACE ZMIENNE / STYLE / FLAGI


    /// metoda ktora ustala czy slide ma byc zmieniony (canIClick)
    readyToClick = () => {
        setTimeout(() => {
            this.canIClick = true
        }, this.transition * 1000)
    }
    //// metoda ustalająca poprzedni index slidera
    changeValueOfVariables = () => {
        this.remaindMeLastIndex = this.indexOfShowedSlider;
    }
    
    /// funkcja dodajaca/odejmujaca transition
    addTransition = (shouldIAdd) => {
        if (shouldIAdd) {
            this.slider.style.transition = `${this.transition}s`;
        } else {
            this.slider.style.transition = "none";
        } 
    }
  
    /// odczytuje szerokosc widocznych sliderów *szerokosc kontenera overflow*
    readWidthOfVisibleElement = () => {
       
            this.widthOfVisibleElement = this.slider.offsetWidth;
      
    }

    readHeightOfVisibleElement = ()=>{
        this.heightOfVisibleElement=this.section.offsetHeight
    }

    //// odczytyje ilośc widocznych elementów ( bierze pod uwage margin)
    checkAmountOfElements = () => {
        const style = this.sliderElements[0].currentStyle || window.getComputedStyle(this.sliderElements[0]);
        let lastAmountOfVisibleElements;

        const marginLeft = style.marginLeft
        const marginRight = style.marginRight

        lastAmountOfVisibleElements = this.amountOfVisibleElements === null ? Math.round(this.widthOfVisibleElement / (this.sliderElements[0].offsetWidth + parseFloat(marginRight.substr(0, marginRight.length - 2)) + parseFloat(marginLeft.substr(0, marginLeft.length - 2)))) : this.amountOfVisibleElements

        this.amountOfVisibleElements = Math.round(this.widthOfVisibleElement / (this.sliderElements[0].offsetWidth + parseFloat(marginRight.substr(0, marginRight.length - 2)) + parseFloat(marginLeft.substr(0, marginLeft.length - 2))))

        this.shouldBeClear(lastAmountOfVisibleElements)

        if (this.animation === "vertical") {
            this.slider.style.transform = "translateY(0)"
            const marginTop = style.marginTop
            const marginBottom = style.marginBottom



            lastAmountOfVisibleElements = this.amountOfVisibleElements === null ? Math.round(this.heightOfVisibleElement / (this.sliderElements[0].offsetHeight + parseFloat(marginTop.substr(0, marginTop.length - 2)) + parseFloat(marginBottom.substr(0, marginBottom.length - 2)))) : this.amountOfVisibleElements


            this.amountOfVisibleElements = Math.round(this.heightOfVisibleElement / (this.sliderElements[0].offsetHeight + parseFloat(marginTop.substr(0, marginTop.length - 2)) + parseFloat(marginBottom.substr(0, marginBottom.length - 2))))
            this.shouldBeClear(lastAmountOfVisibleElements)
        }
    }


     //// metoda zwracająca true/false przy sprawdzeniu czy kliknieta kropka jest ostatnia kropką
     isTheLast = (indexOfClickedDot) => {
        let flag;
        this.controlPanelElements.forEach(controlPanelElement => {
            if (indexOfClickedDot === this.controlPanelElements.length - 1) {
                flag = true;
            }
        })
        return flag;
    }

    /// metida która łapie moment zmiany widocznych elementów i gdy to się stanie generuje na nowo navigacje
    shouldBeClear = (variable) => {
        if (variable !== this.amountOfVisibleElements) {
            this.controlPanel.innerHTML = "";
            this.createControlPanel(this.amountOfVisibleElements);
        }
    }

    /// metoda ustalająca która kropka jest aktywna i dopasowująca do niej slider ( pierwszy od lewej) z grupy odpowiadającej indexowi elementu nawigacji
    checkWhichDotNeedToBeActive = (way, index = null) => {
        if (way === "left") {
            const searchingDotWithIndex = parseInt(this.sliderElements[0].dataset.group)
            this.addActiveForAnItem(this.controlPanelElements[searchingDotWithIndex])
            this.removeActiveForAnItems(this.sliderElements)
            this.addActiveForAnItem(this.sliderElements[0])
            return
        }
        if (way === "dot") {
            const activeElement = this.slider.querySelector(`[data-group="${index}"]`)
            this.removeActiveForAnItems(this.sliderElements)
            this.addActiveForAnItem(activeElement)
        }
        if (way === "right") {
            this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
            this.sliderElements.forEach((sliderElement, index) => {
                if (sliderElement.classList.contains("active")) {
                    this.reduceDotIndex()
                    this.removeActiveForAnItems(this.sliderElements)
                    this.removeActiveForAnItems(this.controlPanelElements)
                    let activeSlide = this.sliderElements[index - this.amountOfVisibleElements]
                    if (!activeSlide) {
                        this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
                        activeSlide = this.sliderElements[this.sliderElements.length - 1]
                        console.log(activeSlide.textContent);
                    }
                    this.addActiveForAnItem(activeSlide)
                    const activeDot = parseInt(activeSlide.dataset.group)
                    this.addActiveForAnItem(this.controlPanelElements[activeDot])
                }
            })
        }
    }


    ////////// METODY TWORZACE/RESETUJACE ELEMENTY

    /// tworzy elementy HTML
    createElement = (item, classForItem, dataset = null, container) => {
        const element = document.createElement(item)
        element.classList.add(classForItem)
        if (dataset || dataset === 0) {
            element.dataset.index = dataset
        }
        container.appendChild(element)
        return element
    }
    /// tworzenie panelu z kropkami
    createControlPanel = (numberOfDots = null) => {
        console.log('robie kontrolpanel');
        let indexForDot = -1
        this.sliderElements.forEach((sliderElement, index) => {
            if (numberOfDots && index % numberOfDots === 0) {
                indexForDot += 1
                this.createElement("div", "js__MainSlider-control-element", indexForDot, this.controlPanel).addEventListener("click", (e) => {
                    this.changeValueOfVariables()
                    this.removeActiveForAnItems(this.sliderElements)
                    this.removeActiveForAnItems(this.controlPanelElements)
                    this.lastElementWasClicked = false
                    this.indexManualyChanged = true
                    this.addActiveForAnItem(e.target)
                    if (this.amountOfVisibleElements > 1 && this.sliderElements.length % this.amountOfVisibleElements) {
                        if (this.dotClicked && this.isTheLast(parseInt(e.target.dataset.index))) {
                            this.lastElementWasClicked = true
                            this.moveIntoSlideWithIndex(parseInt(e.target.dataset.index))
                            this.fillEmptySpace()
                            this.checkWhichDotNeedToBeActive("dot", parseInt(e.target.dataset.index))
                            return
                        }
                        if (this.dotClicked) {
                            this.moveIntoSlideWithIndex(parseInt(e.target.dataset.index))
                            this.indexOfLastActiveDot = parseInt(e.target.dataset.index)
                            this.checkWhichDotNeedToBeActive("dot", parseInt(e.target.dataset.index))
                            return
                        }
                        this.resetContainer()
                        if (this.isTheLast(parseInt(e.target.dataset.index))) {
                            this.lastElementWasClicked = true
                            this.fillEmptySpace()
                        }
                        this.fadeElements(parseInt(e.target.dataset.index))
                        this.dotClicked = true
                        this.indexOfLastActiveDot = parseInt(e.target.dataset.index)
                        this.checkWhichDotNeedToBeActive("dot", parseInt(e.target.dataset.index))
                        return
                    }
                    this.dotClicked = true
                    this.changeIndexByClickOnDot(e)
                    if (this.animation === "fade") {
                        this.removeActiveForAnItems(this.sliderElements)
                        this.addActiveForAnItem(this.sliderElements[e.target.dataset.index])
                    }
                    if (this.amountOfVisibleElements === 1 && this.animation != "fade") {
                        this.resetContainer()
                        this.addTransition(false)
                        this.slider.style.transform = `translateX(-${this.indexOfLastActiveDot*this.widthOfVisibleElement}px)`
                        this.indexOfShowedSlider = parseInt(e.target.dataset.index)
                        setTimeout(() => {
                            this.addTransition(true)
                            this.slider.style.transform = `translateX(-${this.indexOfShowedSlider*this.widthOfVisibleElement}px)`
                        }, 100)
                        this.checkWhichDotNeedToBeActive("dot", parseInt(e.target.dataset.index))
                        this.indexOfLastActiveDot = parseInt(e.target.dataset.index)
                        this.sliderElements = this.startingSliderElements
                        return
                    }
                    if (this.animation === "horizontal") {
                        this.moveIntoSlideWithIndex(parseInt(e.target.dataset.index))
                        this.dotClicked = true
                        this.indexOfLastActiveDot = parseInt(e.target.dataset.index)
                    }
                    this.checkWhichDotNeedToBeActive("dot", parseInt(e.target.dataset.index))
                })
            }
        })
        this.controlPanelElements = this.controlPanel.querySelectorAll(".js__MainSlider-control-element")
    }

     /// resetuje caly container w ktorym sa slidy i nadaje je od nowa tak jak byly na poczatku
     resetContainer = () => {
        this.slider.innerHTML = ""
        this.startingSliderElements.forEach(sliderElement => {
            this.slider.appendChild(sliderElement)
        })
    }

    ////// METODY DLA INDEXU

    /// zwiększenie indexu elementu navigacji + zmienna indexOfLastActiveDot
    increseDotIndex = () => {
        this.controlPanelElements.forEach((controlPanelElement, index) => {
            if (controlPanelElement.classList.contains("active")) {
                this.indexOfLastActiveDot = index + 1
            }
        })
        this.controlPanelElements.forEach(controlPanelElement => {
            controlPanelElement.classList.remove("active")
        })
        this.indexOfLastActiveDot = this.indexOfLastActiveDot > this.controlPanelElements.length - 1 ? 0 : this.indexOfLastActiveDot
        this.indexOfLastActiveDot = this.indexOfLastActiveDot < 0 ? this.controlPanelElements.length - 1 : this.indexOfLastActiveDot
        this.controlPanelElements[this.indexOfLastActiveDot].classList.add("active")
    }
    /// zmniejszenie indexu elementu nawigazji + zmienna indexOfLastActiveDot
    reduceDotIndex = () => {
        this.controlPanelElements.forEach((controlPanelElement, index) => {
            if (controlPanelElement.classList.contains("active")) {
                this.indexOfLastActiveDot = index - 1
            }
        })
        this.controlPanelElements.forEach(controlPanelElement => {
            controlPanelElement.classList.remove("active")
        })
        this.indexOfLastActiveDot = this.indexOfLastActiveDot > this.controlPanelElements.length - 1 ? 0 : this.indexOfLastActiveDot
        this.indexOfLastActiveDot = this.indexOfLastActiveDot < 0 ? this.controlPanelElements.length - 1 : this.indexOfLastActiveDot
        this.controlPanelElements[this.indexOfLastActiveDot].classList.add("active")
    }

    /// dla IndexOfShowedSlider => kontrola zmiennej
    repairIndex = () => {
/////////////////////////////??????????????????????
        if (this.animation === "horizontal") {
            this.indexOfShowedSlider = this.indexOfShowedSlider > this.controlPanelElements.length - 1 ? 0 : this.indexOfShowedSlider
            this.indexOfShowedSlider = this.indexOfShowedSlider < 0 ? this.controlPanelElements.length - 1 : this.indexOfShowedSlider
        }
        this.indexOfShowedSlider = this.indexOfShowedSlider > this.sliderElements.length - 1 ? 0 : this.indexOfShowedSlider
        this.indexOfShowedSlider = this.indexOfShowedSlider < 0 ? this.sliderElements.length - 1 : this.indexOfShowedSlider
    }
    // zmniejsza index i zmienia slide ( dla fade)
    reduceIndex = () => {
        this.indexOfShowedSlider -= 1
        this.changeSlide()
    }
    // zwieksza index i zmienia slide ( dla fade)
    increaseIndex = () => {
        this.indexOfShowedSlider += 1
        this.changeSlide()
        this.increseDotIndex()
    }

    /// zmiana indexu kropki poprzez klikniecie w nia
    changeIndexByClickOnDot = (e) => {
        this.indexOfShowedSlider = parseInt(e.target.dataset.index);
    }
    ///////// INTERVAL 

    /// interval
    setInterval = () => {
        this.intervalForSlider = setInterval(() => {
            if (this.animation === "fade") {
                this.increaseIndex();
            }
            if (this.animation === "horizontal") {
                this.moveIntoNextSlide()
                if (this.sliderElements.length % this.amountOfVisibleElements) {
                    this.removeActiveForAnItems(this.controlPanelElements)
                }
            }
        }, this.intervalTime)
    }


    /////////// ZMETODY DO ZWYKLEJ ZMIANY SLIDE 
    changeSlide = () => {
        this.repairIndex();
        this.sliderElements.forEach(sliderElement => {
            sliderElement.classList.remove("active")
        });
        this.sliderElements[this.indexOfShowedSlider].classList.add("active")
    }
    /// zmiana slidu w prawo ( dodanie odjecie slidow i przełożenie ich (append ))
    moveIntoNextSlide = () => {
        if (this.amountOfVisibleElements > 1) {
            if (this.lastElementWasClicked || this.dotClicked && this.controlPanelElements[this.controlPanelElements.length - 1].classList.contains("active")) {
                const numberOfItemsToDelate = this.amountOfVisibleElements - (this.startingSliderElements.length % this.amountOfVisibleElements)
                this.sliderElements.forEach((sliderElement, index) => {
                    if (index >= numberOfItemsToDelate) {
                        this.elementsToCopy.push(sliderElement.cloneNode(true))
                    }
                    this.elementsToCopy.forEach(elementToCopy => {
                        this.slider.appendChild(elementToCopy)
                    })
                    this.elementsToCopy = []
                    this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
                })
            }
        }

        this.addTransition(true)
        this.increseDotIndex()

        this.slider.style.transform = `translateX(-${this.widthOfVisibleElement*(this.indexOfShowedSlider+1)}px)`
        if (this.animation === "vertical") {
            this.slider.style.transform = `translateY(-${this.heightOfVisibleElement*(this.indexOfShowedSlider+1)}px)`
        }
        this.indexOfShowedSlider += 1
        this.changeValueOfVariables()
        this.copyElementsForRight()
        setTimeout(() => {
            this.removeCloneElementsForRight()
            this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
            this.addTransition(false)
            this.slider.style.transform = `translateX(-${0}px)`
            this.indexOfShowedSlider = 0
            this.checkWhichDotNeedToBeActive("left")
            if (this.amountOfVisibleElements > 1) {
                if (this.lastElementWasClicked || this.dotClicked && this.controlPanelElements[0].classList.contains("active")) {
                    this.lastElementWasClicked = false
                    const numberOfItemsToDelate = this.amountOfVisibleElements - (this.startingSliderElements.length % this.amountOfVisibleElements)

                    const newSliders = []
                    const lastSlides = []

                    this.slider.innerHTML = ""
                    this.startingSliderElements.forEach((sliderElement, index) => {
                        if (index >= numberOfItemsToDelate) {
                            newSliders.push(sliderElement)
                        }


                    })

                    this.startingSliderElements.forEach((sliderElement, index) => {
                        if (index < numberOfItemsToDelate) {
                            lastSlides.push(sliderElement)
                        }


                    })

                    newSliders.forEach(slide => {
                        this.slider.appendChild(slide)
                    })

                    lastSlides.forEach(slide => {
                        this.slider.appendChild(slide)
                    })
                    this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")

                    this.checkWhichDotNeedToBeActive("left")


                }
            }

            this.dotClicked = false

        }, this.transition * 1000)





    }

    /// meroda ktora kopiuje elementy dla ruchu w prawo
    copyElementsForRight = () => {
        if (this.amountOfVisibleElements > 1) {
            this.sliderElements.forEach((sliderElement, index) => {
                if (index < this.amountOfVisibleElements * this.indexOfShowedSlider) {
                    this.elementsToCopy.push(sliderElement.cloneNode(true))
                }
            })
        } else {
            this.sliderElements.forEach((sliderElement, index) => {
                if (index < this.indexOfShowedSlider) {
                    this.elementsToCopy.push(sliderElement.cloneNode(true))
                }
            })
        }


        this.elementsToCopy.forEach(elementToCopy => {
            this.slider.appendChild(elementToCopy)

        })

        this.elementsToCopy = []


    }
    /// usuwa niepotrzebne elementy dla ruchu w prawo
    removeCloneElementsForRight = () => {
        if (this.amountOfVisibleElements > 1) {
            this.sliderElements.forEach((sliderElement, index) => {
                if (index < this.amountOfVisibleElements * this.indexOfShowedSlider) {
                    this.slider.removeChild(sliderElement)
                }
            })
        } else {
            this.sliderElements.forEach((sliderElement, index) => {
                if (index < this.indexOfShowedSlider) {
                    this.slider.removeChild(sliderElement)
                }
            })
        }
        this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
    }

    ///zmiana slidu w lewo ( dodajenie odjecie slidow i przełozenie ich ( prepend))
    moveIntoPrevSlide = () => {
        if (this.amountOfVisibleElements > 1) {
            if (this.lastElementWasClicked) {
                this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
                this.addTransition(true)
                // this.slider.style.transform = `translateX(-${this.widthOfVisibleElement *(this.indexOfShowedSlider-1)}px)`
                if (this.animation === "vertical") {
                    this.slider.style.transform = `translateY(-${this.heightOfVisibleElement*(this.indexOfShowedSlider-1)}px)`
                }
                if (this.animation === "horizontal") {
                    this.slider.style.transform = `translateX(-${this.widthOfVisibleElement *(this.indexOfShowedSlider-1)}px)`
                }
                this.lastElementWasClicked = false
                setTimeout(() => {
                    this.resetContainer()
                    this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
                    this.indexOfShowedSlider -= 1
                    this.dotClicked = false
                    this.checkWhichDotNeedToBeActive("right")
                }, this.transition * 1000)
                return
            }
            if (this.dotClicked && this.controlPanelElements[0].classList.contains("active")) {
                this.resetContainer()
                this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
            }
        }
        this.dotClicked = false
        this.addTransition(false)
        this.copyElementsForLeft()
        this.lastElementWasClicked = false
        // this.slider.style.transform = `translateX(-${this.widthOfVisibleElement *(this.indexOfShowedSlider+1)}px)`
        if (this.animation === "horizontal") {
            this.slider.style.transform = `translateX(-${this.widthOfVisibleElement *(this.indexOfShowedSlider+1)}px)`
        }
        
        if (this.animation === "vertical") {
            this.slider.style.transform = `translateY(-${this.heightOfVisibleElement *(this.indexOfShowedSlider+1)}px)`
        }
        setTimeout(() => {
            this.addTransition(true)
            if (this.animation === "horizontal") {
                this.slider.style.transform = `translateX(-${this.widthOfVisibleElement *this.indexOfShowedSlider}px)`
            }
            // this.slider.style.transform = `translateX(-${this.widthOfVisibleElement *this.indexOfShowedSlider}px)`
            if (this.animation === "vertical") {
                this.slider.style.transform = `translateY(-${this.heightOfVisibleElement*(this.indexOfShowedSlider)}px)`
            }
        }, this.transition * 100)
        if (this.amountOfVisibleElements === 1) {
            this.checkWhichDotNeedToBeActive("right")
        }
        setTimeout(() => {
            this.removeCloneElementsForLeft()
            if (this.amountOfVisibleElements > 1) {
                this.checkWhichDotNeedToBeActive("right")
            }
        }, this.transition * 1000)
        this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
    }
/// meroda ktora kopiuje elementy dla ruchu w lewo
    copyElementsForLeft = () => {
        this.sliderElements.forEach((sliderElement, index) => {
            if (index >= this.sliderElements.length - this.amountOfVisibleElements) {
                this.elementsToCopy.push(sliderElement.cloneNode(true))
            }
        })
        this.elementsToCopy.reverse()
        this.elementsToCopy.forEach(elementToCopy => {
            this.slider.prepend(elementToCopy)
        })
        this.elementsToCopy = []
    }

    // usuwa niepotrzebne elementy dla ruchu w lewo
    removeCloneElementsForLeft = () => {
        this.sliderElements.forEach((sliderElement, index) => {
            if (index >= this.sliderElements.length - this.amountOfVisibleElements) {
                this.slider.removeChild(sliderElement)
            }
        })
        this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
    }

  ////// METODY DLA NAWIGACJI


  /// metoda ktora po kliknieciu w kropke ostatnia wypelnia puste miejsce w sliderze
  fillEmptySpace = () => {
    this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
    const itemsToAppend = []
    const numberOfItemsToAppend = this.amountOfVisibleElements - (this.sliderElements.length % this.amountOfVisibleElements)
    for (let index = 0; index < numberOfItemsToAppend; index++) {
        itemsToAppend.push(this.sliderElements[index].cloneNode(true))
    }
    itemsToAppend.forEach(itemToAppend => {
        this.slider.appendChild(itemToAppend)
    })
}
    //// klik w kropke po raz pierwszy dodaje animacje pojawiania sie sliderow 
    fadeElements = (index) => {
        this.addTransition(false)
        this.slider.style.transform = `translateX(-${index*this.widthOfVisibleElement}px)`
        this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
        let delay = 0.1
        this.indexOfShowedSlider = index
        this.sliderElements.forEach((sliderElement, index) => {
            delay = index % this.amountOfVisibleElements * 0.1
            this.sliderElements[index].style.transitionDelay = `${delay}s`;
            sliderElement.style.opacity = "0"
            setTimeout(() => {
                sliderElement.style.transitionDuration = `.5s`
                sliderElement.style.opacity = "1"
            }, 200)
        })
    }

    moveIntoSlideWithIndex = (index) => {
        if (index === this.controlPanelElements.length - 1) {
            this.addTransition(false)
            this.indexOfShowedSlider = index
            this.slider.style.transform = `translateX(-${this.indexOfLastActiveDot*this.widthOfVisibleElement}px)`
            setTimeout(() => {
                this.addTransition(true)
                this.slider.style.transform = `translateX(-${index*this.widthOfVisibleElement}px)`
            }, 100)
            this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
            this.indexOfLastActiveDot = index
            return
        }
        if (this.indexOfLastActiveDot != this.controlPanelElements.length - 1) {
            this.resetContainer()
        }
        this.addTransition(false)
        this.indexOfShowedSlider = index
        this.slider.style.transform = `translateX(-${this.indexOfLastActiveDot*this.widthOfVisibleElement}px)`
        setTimeout(() => {
            this.addTransition(true)
            this.slider.style.transform = `translateX(-${index*this.widthOfVisibleElement}px)`
        }, 100)
        this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
        this.indexOfLastActiveDot = index
    }
   

//// METODY NIWELUJACE POWTARZAJĄCY SIE KOD


    addActiveForAnItem = (item) => {
        item.classList.add("active")
    }
    removeActiveForAnItems = (groupOfItems) => {
        groupOfItems.forEach(item => {
            item.classList.remove("active")
        })
    }

}




/// KLASY

/// js__MainSlider => na slider ale nie ma container
/// js__MainSlider-arrow--left => strzalka w lewo
/// js__MainSlider-arrow--right => strzałka w prawo
/// js__MainSlider-controler => dla kontenera na kropki
/// js__MainSlider-element => dla każdego slida
/// js__MainSlider-control-element => dla kazdej kropki I TO STYLOWAC
/// js__MainSlider-hidden => na strzalki pojedyncze LUB/I na kontener z kropkami czy maja byc schowane jak nie ma na nich myszki


/// daty

///data-interval="milisekundy" => dla js__MainSlider czas co ile ma się zmieniać slide
/// data-mobile=true => dla js__MainSlider rozpoznawanie touches 

/// data-animate="fade" => dla js__MainSlider  jak maja slidy sie przenikac przez siebie
/// data-animate="horizontal" => dla js__MainSlider  jak slider jest lewo prawo


/// horizontal NIE MOZE BYC NTH CHILD STYLOWANE BO BEDA SIE ZMIENIAC CHILDY 