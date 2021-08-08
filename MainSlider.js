class MainSlider {

    /// ustalanie zmiennych
    constructor(rootClass) {
        this.section = document.querySelector(`.${rootClass}`); // sekcja
        this.slider = this.section.querySelector(".js__MainSlider"); // slider

        this.startingSliderElements = this.section.querySelectorAll(".js__MainSlider-element"); // elementy slidera nie zmieniajace sie
        this.sliderElements = this.section.querySelectorAll(".js__MainSlider-element"); // elementy slidera

        this.intervalTime = null; // czas intervalu

        this.arrowLeft = null; // strzalka w lewo
        this.arrowRight = null; // strzalka w prawo

        this.controlPanel = null; // panel z kropkami
        this.controlPanelElements = null; // kropki 

        this.isHiddenLeft = null; // czy ma byc ukryta lewa strzalka
        this.isHiddenRight = null; // czy ma byc ukryta prawa strzalka


        this.amountOfVisibleElements = null /// ule elementow jest na slidzie




        this.indexOfShowedSlider = null; // index

        this.intervalForSlider = null; // interval

        this.animation = null; // jaka jest animacja


        this.numberOfWidthToChange = null; // przesuwanie lewo prawo sliderow o ile
        this.widthOfVisibleElement = null; // szerokość widocznego kontenera w sliderze przesuwanym

        /// flagi
        this.indexManualyChanged = false // kliknieta byla kropka
        this.shouldBeAnimated = true // czy powinien sie animowac
        this.intervalUsed = false // czy jest po intervale

        this.transition = 1
        this.indexOfItemToRemove = 0
        this.canIClick = true
        
        this.indexOfLastActiveDot=0
        this.numberOfElementsToFill=0
        this.lastElementWasClicked=false

        ////
        this.remaindMeLastIndex = this.indexOfShowedSlider // zapamietuje ostatni index
        this.elementsToCopy = []
        /// poczatkowe funcje inicjalizujace slider
        this.readIndex(); // pobranie staryujacego indexu
        this.getVariables(); // przypisuje wartości do w.w elementow
        this.initSlider(); // po odczytaniu danych odpala funkcje ktore powinien
        this.addDatasetForSliders()
        


    }

    //////// INICJOWANIE SLIDERA I POCZATKOWYCH JEGO WARTOSCI/ ZMIENNYCH

    /// czyta index na podstawie elementu oznaczonego jako active w html
    readIndex = () => {
        this.sliderElements.forEach((sliderElement, index) => {
            if (sliderElement.classList.contains("active")) {
                this.indexOfShowedSlider = index;

            }
        })

    }
    /// przypisanie do zmiennych wartosci
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

    }
    /// odczytuje dane i odpala funkcje na podstawie podanych opcji
    initSlider = () => {
        if (this.controlPanel) {
            this.checkAmountOfElements()
            
            this.createControlPanel(this.amountOfVisibleElements)
            this.groupSliderElements()
            window.addEventListener('resize', () => {
                this.checkAmountOfElements()
            })
            this.addStartedActive()
        }
        /// strzałka w lewo
        if (this.arrowLeft) {
            /// listener
            this.arrowLeft.addEventListener("click", () => {
                // zmienia flage na true
                this.indexManualyChanged = true;
                // czyści interval zeby nie kolidował z przesuwaniem na przycisk
                clearInterval(this.intervalForSlider);
                // jeżeli opcja to fade slider
                if (this.animation === "fade") {
                    // zmniejsza index -1
                    this.reduceIndex();
                }
                // jeżeli jest slider horyzontalny
                if (this.animation === "horizontal100" || this.animation === "horizontal100-s") {
                    // zmiana że powinien być animowany
                    // this.shouldBeAnimated = true
                    // //przypisanie intervalu czy byl uzyty
                    // this.changeValueOfVariables()

                    // // obniza index
                    // this.reduceIndex()
                    // // dodaje transition
                    // // this.addTransition(this.slider,this.transition)
                    // /
                    // // this.slider.style.transition = "0.2s"
                    // //pokazuje slider z indexem
                    // this.showSliderWithIndex()
                    if (this.canIClick) {
                      
                        this.canIClick = false
                        this.moveIntoPrevSlide()
                        this.readyToClick()
                        if (this.sliderElements.length%this.amountOfVisibleElements) {
                            this.removeActiveForAnItems(this.controlPanelElements)
                            
                        }
                    }
                }

            })
        }
        if (this.arrowRight) {
            this.arrowRight.addEventListener("click", () => {
                this.indexManualyChanged = true
                clearInterval(this.intervalForSlider)
                if (this.animation === "fade") {
                    this.increaseIndex()
                }
                if (this.animation === "horizontal100" || this.animation === "horizontal100-s") {
                    // this.changeValueOfVariables()
                    // this.increaseIndex()
                    // this.shouldBeAnimated = true

                    // this.showSliderWithIndex()
                    /////////////////////////////////

                    if (this.canIClick) {
                        this.canIClick = false
                        this.moveIntoNextSlide()
                        this.readyToClick()
                        if (this.sliderElements.length%this.amountOfVisibleElements) {
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
        if (this.animation === "horizontal100") {
            this.readWidthOfVisibleElement()
        }
        if (this.animation === "horizontal100-s" || this.animation === "horizontal100") {
            this.readWidthOfVisibleElement()

            this.addStartedActive();


        }
        if (this.animation === "vertical100-s") {
            this.readHeightOfVisibleElement()

        }
    }
    /// fukcja przypisujaca ostatni index zamiast kolejnego indexu (dla intervalu )
    changeValueOfVariables = () => {
       
            this.remaindMeLastIndex = this.indexOfShowedSlider
           
                
           
       
    }
    addStartedActive = () => {


        this.controlPanelElements[this.indexOfShowedSlider].classList.add("active")

    }


    //////////// METODY KONTROLUJACE DZIALANIE DANEGO OBIEKTU

 groupSliderElements=()=>{
    if (this.amountOfVisibleElements>1) {
        let numberOfGroup=0
        let increase=0
        this.sliderElements.forEach((sliderElement,index)=>{
             if(increase>=this.amountOfVisibleElements){
                 numberOfGroup+=1
                 increase=0
             }
       increase++  
       this.sliderElements[index].dataset.group=numberOfGroup
         })
            
    }
 }
 
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
            this.setInterval()


        })
        this.section.addEventListener("mouseenter", (e) => {
            clearInterval(this.intervalForSlider)

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
            if(e.target.closest(".js__MainSlider-arrow--right")||e.target.closest(".js__MainSlider-arrow--left")||e.target.closest(".js__MainSlider-control-element")){
                clearInterval(this.intervalForSlider) 

            return
            }

            clearInterval(this.intervalForSlider)
            if (this.animation === "fade") {
              
                if (touchStart > touchEnd) {
                   
                    this.increaseIndex()

                } else {
                    this.reduceIndex()
                }
            }




            if (this.animation === "horizontal100" || this.animation === "horizontal100-s") {
                this.indexManualyChanged = true
                if (touchStart > touchEnd) {
                    this.changeValueOfVariables()
                    this.increaseIndex()
                    this.shouldBeAnimated = true
                    this.addTransition(true)
                    this.showSliderWithIndex()
                } else {
                    this.changeValueOfVariables()
                    this.reduceIndex()
                    this.shouldBeAnimated = true
                    this.addTransition(true)
                    this.showSliderWithIndex()
                }
            }
            this.setInterval()

        })
        this.slider.addEventListener("touchmove", (e) => {

            touchEnd = e.touches[0].clientX

        })
    }


    ////////// METODY ZMIENIAJACE ZMIENNE / STYLE / FLAGI

    /// funkcja dodajaca/odejmujaca transition
    addTransition = (shouldIAdd) => {
        if (shouldIAdd) {
            this.slider.style.transition = `${this.transition}s`;


        } else {
            this.slider.style.transition = "none";

        }

    }
    /// po kliknieciu zmienia index na ten krory jest zapisany w dacieset w kropce

    // zmiana zmiennej na podstawie aktywnej kropki SHOULD BE ANIMATED
    checkDot = (e) => {
        this.shouldBeAnimated = e.target.classList.contains("active") ? false : true
    }
    /// odczytuje szerokosc pojedynczego slide
    readWidthOfVisibleElement = () => {
        window.addEventListener('resize', () => {


            this.widthOfVisibleElement = this.slider.offsetWidth;





        })
    }
    readHeightOfVisibleElement = () => {
        window.addEventListener('resize', () => {

            this.heightOdVisibleElement = this.section.offsetHeight

        })



    }
    checkAmountOfElements = () => {
        const style = this.sliderElements[0].currentStyle || window.getComputedStyle(this.sliderElements[0]);
        let lastAmountOfVisibleElements;

        this.slider.style.transform = "translateX(0)"

        const marginLeft = style.marginLeft
        const marginRight = style.marginRight

        lastAmountOfVisibleElements = this.amountOfVisibleElements === null ? Math.round(this.widthOfVisibleElement / (this.sliderElements[0].offsetWidth + parseFloat(marginRight.substr(0, marginRight.length - 2)) + parseFloat(marginLeft.substr(0, marginLeft.length - 2)))) : this.amountOfVisibleElements



        this.amountOfVisibleElements = Math.round(this.widthOfVisibleElement / (this.sliderElements[0].offsetWidth + parseFloat(marginRight.substr(0, marginRight.length - 2)) + parseFloat(marginLeft.substr(0, marginLeft.length - 2))))

        this.shouldBeClear(lastAmountOfVisibleElements)



        if (this.animation === "vertical100-s") {
            this.slider.style.transform = "translateY(0)"
            const marginTop = style.marginTop
            const marginBottom = style.marginBottom



            lastAmountOfVisibleElements = this.amountOfVisibleElements === null ? Math.round(this.heightOfVisibleElement / (this.sliderElements[0].offsetHeight + parseFloat(marginTop.substr(0, marginTop.length - 2)) + parseFloat(marginBottom.substr(0, marginBottom.length - 2)))) : this.amountOfVisibleElements


            this.amountOfVisibleElements = Math.round(this.heightOfVisibleElement / (this.sliderElements[0].offsetHeight + parseFloat(marginTop.substr(0, marginTop.length - 2)) + parseFloat(marginBottom.substr(0, marginBottom.length - 2))))
            this.shouldBeClear(lastAmountOfVisibleElements)
        }

    }


    ////////// METODY TWORZACE/RESETUJACE ELEMENTY
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
        let indexForDot = -1


        this.sliderElements.forEach((sliderElement, index) => {
            if (numberOfDots && index % numberOfDots === 0) {

                indexForDot += 1
                this.createElement("div", "js__MainSlider-control-element", indexForDot, this.controlPanel).addEventListener("click", (e) => {
                    this.changeValueOfVariables()
                    this.lastElementWasClicked=false
                    this.indexManualyChanged = true
                    this.removeActiveForAnItems(this.controlPanelElements)
                    this.addActiveForAnItem(e.target)
                    if (this.amountOfVisibleElements>1) {
                        
                        
                        this.resetContainer()
                        if (this.isTheLast(parseInt(e.target.dataset.index))) {
                            console.log('ostatnia kropka');
                        //    this.indexOfShowedSlider=this.controlPanelElements.length-1
                            this.lastElementWasClicked=true
                        
                           
                        }
                        this.fadeElements(parseInt(e.target.dataset.index))
                        
                        return
                    }
                    
                    this.changeIndexByClickOnDot(e)
                    if (this.animation === "fade") {
                        this.removeActiveForAnItems(this.sliderElements)
                        this.addActiveForAnItem(this.sliderElements[e.target.dataset.index])
                    }
                    if(this.animation === "horizontal100"||this.animation === "horizontal100-s"){
                        this.moveIntoSlideWithIndex(parseInt(e.target.dataset.index))
                    }
                })



            }

        })

        this.controlPanelElements = this.controlPanel.querySelectorAll(".js__MainSlider-control-element")

    }


isTheLast=(indexOfClickedDot)=>{
    let flag
    
this.controlPanelElements.forEach(controlPanelElement=>{
    if (indexOfClickedDot===this.controlPanelElements.length-1) {
      flag= true 
      
    }
   
   
})
 return flag
}

    
    moveIntoSlideWithIndex=(index)=>{
this.resetContainer()
this.addTransition(false)

this.indexOfShowedSlider=index
this.slider.style.transform=`translateX(-${this.indexOfLastActiveDot*this.widthOfVisibleElement}px)`


setTimeout(()=>{
    this.addTransition(true)
    this.slider.style.transform=`translateX(-${index*this.widthOfVisibleElement}px)`
},100)
this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
    this.indexOfLastActiveDot=index
    }
    /// resetuje caly container w ktorym sa slidy i nadaje je od nowa tak jak byly na poczatku
    resetContainer = () => {
        this.slider.innerHTML = ""
        this.startingSliderElements.forEach(sliderElement => {
            this.slider.appendChild(sliderElement)
        })
    }



    fadeElements=(index)=>{
     
        this.addTransition(false)
     
        this.slider.style.transform=`translateX(-${index*this.widthOfVisibleElement}px)`
     
        this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
        let delay=0.1
        this.indexOfShowedSlider=index
        this.sliderElements.forEach((sliderElement,index)=>{
            delay=index%this.amountOfVisibleElements*0.1
           
            
            this.sliderElements[index].style.transitionDelay = `${delay}s`;
            sliderElement.style.opacity="0"
            
            setTimeout(()=>{
                sliderElement.style.transitionDuration=`.5s`
                sliderElement.style.opacity="1"
            },200)
           
        })

    
    }

    increseDotIndex=()=>{
        
        this.controlPanelElements.forEach((controlPanelElement,index) => {
            if (controlPanelElement.classList.contains("active")) {
                 this.indexOfLastActiveDot=index+1
            }
            
        })
        this.controlPanelElements.forEach(controlPanelElement => {
            controlPanelElement.classList.remove("active")
            
        })
        
        this.indexOfLastActiveDot = this.indexOfLastActiveDot > this.controlPanelElements.length - 1 ? 0 : this.indexOfLastActiveDot
        this.indexOfLastActiveDot = this.indexOfLastActiveDot < 0 ? this.controlPanelElements.length - 1 : this.indexOfLastActiveDot
      
        

        this.controlPanelElements[this.indexOfLastActiveDot].classList.add("active")
    }
    shouldBeClear = (variable) => {


        if (variable !== this.amountOfVisibleElements) {
            this.controlPanel.innerHTML = ""

            this.createControlPanel(this.amountOfVisibleElements)
        }
    }

    ////// METODY DLA INDEXU

    repairIndex = () => {

        if (this.animation === "horizontal100-s") {
            this.indexOfShowedSlider = this.indexOfShowedSlider > this.controlPanelElements.length - 1 ? 0 : this.indexOfShowedSlider
            this.indexOfShowedSlider = this.indexOfShowedSlider < 0 ? this.controlPanelElements.length - 1 : this.indexOfShowedSlider

        }
        this.indexOfShowedSlider = this.indexOfShowedSlider > this.sliderElements.length - 1 ? 0 : this.indexOfShowedSlider
        this.indexOfShowedSlider = this.indexOfShowedSlider < 0 ? this.sliderElements.length - 1 : this.indexOfShowedSlider

    }
    // zmniejsza index
    reduceIndex = () => {
        this.indexOfShowedSlider -= 1
        this.changeSlide()
    }
    // zwieksza index
    increaseIndex = () => {
        this.indexOfShowedSlider += 1
        this.changeSlide()
    }


    ///////// INTERVAL I METODY DLA NIEGO


    setInterval = () => {
        this.intervalForSlider = setInterval(() => {
            console.log('odpalam interval');
            this.intervalUsed = true;
            if (this.animation === "fade") {
                this.increaseIndex();

            }
            if (this.animation === "horizontal100" || this.animation === "horizontal100-s" || this.animation === "vertical100-s") {
                // // dodanie transition
                // this.addTransition(true);
                // //  ruch slidera
                // this.moveIntoActiveItem();



                ////////////////////////////////////////
                this.moveIntoNextSlide()
                if (this.sliderElements.length%this.amountOfVisibleElements) {
                    this.removeActiveForAnItems(this.controlPanelElements)
                    
                }

            }
        }, this.intervalTime)

    }

    moveIntoActiveItem = () => {
        /// wchodzi do funkcji z opalonym trasition!!!!!!
        /// jezeli wczesniej zostalo cos klikniete a nie jest interval po intercale
        let widthToChange = 0
        this.emptySpace = this.sliderElements.length % this.amountOfVisibleElements
        if (this.emptySpace) {
            if (!this.indexManualyChanged) {
                this.fillEmptySpace()
                widthToChange = -(this.indexOfShowedSlider + 1) * this.widthOfVisibleElement
                this.slider.style.transform = `translateX(${widthToChange}px)`
                setTimeout(() => {
                    this.addTransition(false)
                    this.delateCopy()
                    this.slider.style.transform = `translateX(0px)`

                }, 1000)
                this.indexManualyChanged = false
                return

            }
            if (this.indexManualyChanged) {

                this.fillEmptySpace()
                widthToChange = -(this.indexOfShowedSlider + 1) * this.widthOfVisibleElement
                this.slider.style.transform = `translateX(${widthToChange}px)`

                return
            }



        }


        if (this.indexManualyChanged) {

            /// szerokosc do zmieny to szerokosc pojedynczego elementu razy index wyswietlonego slide +1
            // czyli jezeli jest wyswietlony slide 0 , szerokosc to 500 to slider musi sie przesunac o
            /// 0+1 *500 czyli o 500px ( do 2giego slide)
            let widthToChange = -(this.indexOfShowedSlider + 1) * this.widthOfVisibleElement

            if (this.animation === "vertical100-s") {
                widthToChange = -(this.indexOfShowedSlider + 1) * this.heightOfVisibleElement

            }



            /// jezeli wyswietlony jest ostatni slide


            if (this.indexOfShowedSlider === this.sliderElements.length - 1 || (this.controlPanelElements[this.controlPanelElements.length - 1].classList.contains("active") && this.amountOfVisibleElements)) {

                /// to wez ostatni slide i daj go na sam tyl 
                if (this.indexOfShowedSlider === this.sliderElements.length - 1) {
                    this.slider.appendChild(this.sliderElements[0])

                }
                if ((this.controlPanelElements[this.controlPanelElements.length - 1].classList.contains("active") && this.amountOfVisibleElements)) {
                    for (let index = 0; index < this.amountOfVisibleElements; index++) {
                        this.slider.appendChild(this.sliderElements[index])

                    }
                }


                // nadpisz width to change na pokazany slider -1 * szerokosc elementu czyli
                /// np  jezeli sa 3 slidy czyli index 2 powinien byc pokazany bo to ostatni index bedzie
                /// (2-1)*500 czyli 500 px
                // co oznacza ze slide zostaje na swojej pozycji i wykonuje sie niewidocznie appendchild pierwszego elementu
                /// czytli slider jest teraz indexami 1 2 0 i widoczny jest 2 index
                widthToChange = -(this.indexOfShowedSlider - 1) * this.widthOfVisibleElement
                if (this.animation === "vertical100-s") {
                    widthToChange = -(this.indexOfShowedSlider - 1) * this.heightOfVisibleElement
                }

                /// usuwanie transition zeby nie bylo widac zmiany
                this.addTransition(false)
                /// dodanie tego transform ustalonego wyzej
                this.slider.style.transform = `translateX(${widthToChange}px)`
                if (this.animation === "vertical100-s") {
                    this.slider.style.transform = `translateY(${widthToChange}px)`
                }
                /// set timeout zeby dopiero po jakims czasie odpalila sie funkcja i nie nadpisala innych wartosci
                setTimeout(() => {
                    // dodaje transition
                    this.addTransition(true)
                    // zmienia wartosc zmiennej ktora okresla ile ma sie zmienic transform
                    ///  index pokazanego slida * szerokosc elementu
                    // w tym przypadku 2*500 
                    /// czyli pokaze sie ostatni index czyli zappendowany slide ktory byl na indexie 0
                    widthToChange = -(this.indexOfShowedSlider) * this.widthOfVisibleElement
                    if (this.animation === "vertical100-s") {
                        widthToChange = -(this.indexOfShowedSlider) * this.heightOfVisibleElement
                    }

                    this.slider.style.transform = `translateX(${widthToChange}px)`
                    if (this.animation === "vertical100-s") {
                        this.slider.style.transform = `translateY(${widthToChange}px)`
                    }
                })

                // jezeli nie jest to ostatni index slidera to po prostu dodanie tranforma ktory byl okreslony poza ifem czyli zwyczajne przejdzie do kolejnego slajdu
                // np jest 8 slidow jestesmy na 5 to
                //(5+1)*500 czyli slider musi sie zmienic o 6 szerokosci czyli 0->500->1->500->2->500->3->500->4->500->5->500->6

            } else {

                this.slider.style.transform = `translateX(${widthToChange}px)`
                if (this.animation === "vertical100-s") {
                    this.slider.style.transform = `translateY(${widthToChange}px)`
                }
            }

            /// jezeli to jest kolejny interval z rzedu
        } else {
            /// po prostu zmiana o szerokosc elementu
            this.slider.style.transform = `translateX(${-this.widthOfVisibleElement}px)`
            if (this.animation === "vertical100-s") {
                this.slider.style.transform = `translateY(${-this.heightOfVisibleElement}px)`
            }
            //dodanie transition
            this.addTransition(true)

        }
        // po jakims czasie zmienia style i przerzuca ostatni element
        setTimeout(() => {
          
            // daje transform na 0
            this.slider.style.transform = `translateX(0px)`
            if (this.animation === "vertical100-s") {
                this.slider.style.transform = `translateY(0px)`
            }
           
            // daje transition na 0 (zeby nie bylo widac ze sie cos wydarzylo)
            this.addTransition(false)
            // daje ostatni element na koniec slidera

            if (this.sliderElements.length % this.amountOfVisibleElements === 0) {
                this.appendChild()

            }



        }, this.transition * 1000)









        this.indexManualyChanged = false
    }
    /// funkcja krora okresla i appenduje elementy ktore potrzeba przerzucic na koniec kontenera
    appendChild = (shouldIIncreaseIndex = true) => {


        /// okresla czego ma nie przerzucac, a ma nie przerzucac kolejnego itemu na ktory zaraz interval bedzie najezdzal
        let itemToNOTAppend = this.sliderElements[this.indexOfShowedSlider + 1]

        // okreslenie jakie itemy w takim razie bedzie przerzucal
        let itemsToAppend = [...this.sliderElements].filter((itemsToAppend, index) => {
            // metoda filter przypisuje dzieki temu do zmiennej wszystkie slidy ktore 
            /// nie sa slidem do nie przerzucenia ( czyli o 1 wiekszy od widocznego )
            // i takiego ktorego index jest  mniejszy niz kolejny slide
            // czyli jestesmy na slidzie 2
            /// nie przerzucamy slidu 3
            // przerzucamy wszystko co jest  przed slidem 3
            // czyli 0 1 2

            return itemsToAppend != itemToNOTAppend && index < this.indexOfShowedSlider + 1
        })


        if (this.amountOfVisibleElements) {


            itemsToAppend = [...this.sliderElements].filter((itemsToAppend, index) => {
                return index < (this.indexOfShowedSlider * this.amountOfVisibleElements) + this.amountOfVisibleElements
            })



        }
        /// przerzuca slidy ( index tu jest dla clg zeby sprawdzic)
        itemsToAppend.forEach((itemToAppend, index) => {
          

            this.slider.appendChild(itemToAppend)

        })

        // +1 index
        if (shouldIIncreaseIndex) {
            this.increaseIndex()

        }
    }

    fillEmptySpace = () => {

        const itemsToAppend = []

        this.sliderElements.forEach((sliderElement, index) => {
            if (index < this.amountOfVisibleElements) {
                itemsToAppend.push(sliderElement.cloneNode(true))
            }

        })
        itemsToAppend.forEach(itemToAppend => {
            this.slider.appendChild(itemToAppend)
        })


    }
    delateCopy = () => {
        let itemsToRemove = []

        this.sliderElements.forEach((sliderElement, index) => {
            if (index < this.amountOfVisibleElements) {
                itemsToRemove.push(sliderElement)
               
                this.slider.removeChild(sliderElement)
            }

            this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
        })


    }


    /////////// ZMETODY DO ZWYKLEJ ZMIANY SLIDE ( DLA FADE BARDZIEJ )
    changeSlide = () => {
        // naprawianie indexu

        this.repairIndex();
        // zabiera kazdemu sliderowi active
        this.sliderElements.forEach(sliderElement => {
            sliderElement.classList.remove("active")
        });

        //dodaje active do elementu na podstawie indexu
        this.sliderElements[this.indexOfShowedSlider].classList.add("active")
        if (this.animation === "horizontal100-s") {
            this.sliderElements.forEach(sliderElement => {
                sliderElement.classList.remove("active")
            });

        }


        /// zmienia kropke
        // this.changeActiveControlElement()
        this.increseDotIndex()

    }



    /////////// ZMIANA SLAJDA MANULANIE NIE PRZEZ INTERVAL

    showSliderWithIndex = (e) => {
        // usatwia transition
        this.addTransition(true);
        // jezeli ma byc nie animowane sciaga transition
        if (!this.shouldBeAnimated) {
            this.addTransition(false);
        }

        // jezeli jest po intervale
        if (this.intervalUsed) {
            // czysci caly slider
            this.resetContainer()
            // zmienia trabsition 0
            this.addTransition(false)
            // daje transform na podstawie szerokosci * ostatni index ( czyli zostaje tam gdzie bylo tak zeby nie bylo widac )
            this.slider.style.transform = `translateX(${-this.widthOfVisibleElement*this.remaindMeLastIndex}px)`
            if (this.animation === "vertical100-s") {
                this.slider.style.transform = `translateY(${-this.heightOfVisibleElement*this.remaindMeLastIndex}px)`
            }

            // odpala sie timeout
            setTimeout(() => {
                // daje znow transition
                this.addTransition(true)

                this.slider.style.transform = `translateX(${-this.widthOfVisibleElement*this.indexOfShowedSlider}px)`
                if (this.animation === "vertical100-s") {
                    this.slider.style.transform = `translateY(${-this.heightOfVisibleElement*this.indexOfShowedSlider}px)`
                }
            }, 100)

            // ustawia interval na false
            this.intervalUsed = false
            // konczy dzialanie
            return

        }
        /// bez uzywania interbalu
        this.resetContainer()
        this.slider.style.transform = `translateX(${-this.widthOfVisibleElement*this.indexOfShowedSlider}px)`
        if (this.animation === "vertical100-s") {
            this.slider.style.transform = `translateY(${-this.heightOfVisibleElement*this.indexOfShowedSlider}px)`
        }

        this.intervalUsed = false
    }









   









checkWhichDotNeedToBeActive=(way)=>{
    if (way==="left") {
        const searchingDotWithIndex=parseInt(this.sliderElements[0].dataset.group)
        console.log(searchingDotWithIndex);
        this.addActiveForAnItem(this.controlPanelElements[searchingDotWithIndex])
        this.removeActiveForAnItems(this.sliderElements)
        this.addActiveForAnItem(this.sliderElements[0])
    }
}


    moveIntoNextSlide = () => {
       
        if (this.lastElementWasClicked) {
           this.addTransition(true)
            this.slider.style.transform = `translateX(0px)`
            this.lastElementWasClicked=false
            this.indexOfShowedSlider=0
            this.changeValueOfVariables()

            return
        }
        this.addTransition(true)
        this.increseDotIndex()
        
        this.slider.style.transform = `translateX(-${this.widthOfVisibleElement*(this.indexOfShowedSlider+1)}px)`
        
        this.indexOfShowedSlider+=1
        this.changeValueOfVariables()
        
       
            
            this.slider.style.transform = `translateX(-${this.widthOfVisibleElement*this.sliderElements.lenght}px)`
      
           
            this.copyElementsForRight()

             setTimeout(() => {
             this.removeCloneElementsForRight()
             this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
           
             this.addTransition(false)
             this.slider.style.transform = `translateX(-${0}px)`
            
           
           
            this.indexOfShowedSlider=0
           this.checkWhichDotNeedToBeActive("left")

        }, this.transition * 1000)
        
        // this.copyElementsForRight()
        // setTimeout(() => {
        //     this.removeCloneElementsForRight()
        //     this.addTransition(false)
        //     this.slider.style.transform = `translateX(0px)`
        //     this.indexOfShowedSlider += 1
        //     this.repairIndex()
        //     this.changeActiveControlElement()

        // }, this.transition * 1000)


        // //    setTimeout(()=>{
        // //    },this.intervalTime)


        
    }




    // fill=()=>{
    //     this.numberOfElementsToFill=this.amountOfVisibleElements-(this.sliderElements.length%this.amountOfVisibleElements)
 



        


    // }



    moveIntoPrevSlide = () => {
       
        this.copyElementsForLeft()
        this.addTransition(false)
        this.slider.style.transform = `translateX(-${this.widthOfVisibleElement}px)`
        this.removeCloneElementsForLeft()
        setTimeout(() => {
            this.addTransition(true)
            this.slider.style.transform = `translateX(0px)`
            this.indexOfShowedSlider -= 1
            this.repairIndex()
         
        }, 100)
    }


    copyElementsForLeft = () => {
        this.sliderElements.forEach((sliderElement, index) => {
            if (index > this.sliderElements.length - 1 - this.amountOfVisibleElements) {
                this.elementsToCopy.push(sliderElement.cloneNode(true))

            }
        })
        this.elementsToCopy.reverse()
        this.elementsToCopy.forEach(elementToCopy => {
            this.slider.prepend(elementToCopy)
        })
        this.elementsToCopy = []

    }





    copyElementsForRight = () => {


     
        if (this.amountOfVisibleElements>1) {
            this.sliderElements.forEach((sliderElement, index) => {
                if (index < this.amountOfVisibleElements*this.indexOfShowedSlider) {
                    
                    console.log(sliderElement.textContent + "  kopiuje");
                    this.elementsToCopy.push(sliderElement.cloneNode(true))
    
                }
            })
    
    
         
        }else{

        this.sliderElements.forEach((sliderElement, index) => {
            if (index < this.indexOfShowedSlider) {
              
                this.elementsToCopy.push(sliderElement.cloneNode(true))

            }
        })}


        this.elementsToCopy.forEach(elementToCopy => {
            this.slider.appendChild(elementToCopy)
            
        })

        this.elementsToCopy = []




    }



  
    removeCloneElementsForRight = () => {
        
 
    if (this.amountOfVisibleElements>1) {
        this.sliderElements.forEach((sliderElement, index) => {
            if (index < this.amountOfVisibleElements*this.indexOfShowedSlider) {
               
                console.log(sliderElement.textContent + "  usuwam");
                this.slider.removeChild(sliderElement)

            }
        })
    }else{
        this.sliderElements.forEach((sliderElement, index) => {
            if (index < this.indexOfShowedSlider) {
              
                
                this.slider.removeChild(sliderElement)

            }
        })
    }
        this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")

    }
    removeCloneElementsForLeft = () => {
        this.sliderElements.forEach((sliderElement, index) => {
            if (index > this.sliderElements.length - 1 - this.amountOfVisibleElements) {

                this.slider.removeChild(sliderElement)

            }
        })
        this.sliderElements = this.slider.querySelectorAll(".js__MainSlider-element")
    }

    readyToClick = () => {
        setTimeout(() => {
            this.canIClick = true
        }, this.transition * 1000)
    }

    addActiveForAnItem = (item) => {
        item.classList.add("active")
    }
    removeActiveForAnItems = (groupOfItems) => {
        groupOfItems.forEach(item => {
            item.classList.remove("active")
        })
    }



    changeIndexByClickOnDot = (e) => {

        this.indexOfShowedSlider = parseInt(e.target.dataset.index);

    }


addDatasetForSliders=()=>{
    this.sliderElements.forEach((sliderElement,index)=>{
        sliderElement.dataset.index=index
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
/// data-animate= "horizontal100" => dla js__MainSlider animacja przesuwanialewo prawo gdzie kazde zdjecie ma 100 width
/// data-animate="fade" => dla js__MainSlider  jak maja slidy sie przenikac przez siebie
/// data-animate="horizontal100-s" => dla js__MainSlider  jak jest kilka slidow na jednej stronie i ma sie zmieniac o 100% slide


/// horizontal NIE MOZE BYC NTH CHILD STYLOWANE BO BEDA SIE ZMIENIAC CHILDY 