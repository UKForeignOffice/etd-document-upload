'use strict'

var React = require('react')
var BackButton = require('../../component/BackButton')
var {Navigation} = require('@insin/react-router')

var PhotoGuide = React.createClass({
    mixins: [Navigation],
    statics: {
        title: 'PhotoGuide'
    },

    render() {

        return (
            <div className="grid-row">

                <div className="column-third add-title-margin note">
                    <p><img style={{'height': 'auto', 'width': '300px'}} src="/img/photoguide/aboutyourphoto.jpg"
                            alt="Good example of a passport photo"/>
                        <div className='note'>Example of a good passport photo</div>
                    </p>
                </div>

                <div className="column-two-thirds">

                    <BackButton />
<h1 className="heading-large">
                        How to take your own digital passport photo
                    </h1>
                    <p>This guide will show you how to take a digital photo that meets the emergency travel document
                        photo rules.</p>
                    <div class="help-notice clear-float">
                        <p>Your application will be delayed if your photo doesn’t meet the rules.</p>
                    </div>


                    <hr/>

                    <h3 className="heading-medium">1. Find a camera</h3>
                    <ul className="list-bullet">
                        <li>You can use any device that takes digital photos (eg, a phone, digital camera or tablet).
                        </li>
                        <li>You shouldn’t need to change the settings.</li>
                    </ul>
                    <p><img src="/img/photoguide/diagram-smartphone-digital-camera-tablet-x2.png"
                            className="photoguideimg"/></p>

                    <hr/>

                    <h3 className="heading-medium">2. Get someone to help you</h3>
                    <ul className="list-bullet">
                        <li>Find someone who can take your photo.</li>
                        <li>You can’t take a ‘selfie’ or use a webcam.</li>
                    </ul>

                    <hr/>

                    <h3 className="heading-medium">3. Find a plain background</h3>
                    <ul className="list-bullet">
                        <li>You need to stand in front of a completely plain background.</li>
                        <li>The background should be a light grey or cream colour.</li>
                        <li>Don’t stand in front of a tiled or patterned wall.</li>
                        <li>Make sure there aren’t any objects in view, like a light switch or plant.</li>
                    </ul>
                    <div className="guidance-photos" aria-hidden="true">
                        <ul>
                            <li>
                                <img src="/img/photoguide/image-m2-plain.jpg" alt="Approved"/>
                                <div className="result">
                                    <p className="approved">Approved</p>
                                </div>
                            </li>
                            <li>
                                <img src="/img/photoguide/image-m2-textured-background.jpg" alt="Textured background"/>
                                <div className="result">
                                    <p className="failed">Textured background</p>
                                </div>
                            </li>
                            <li>
                                <img src="/img/photoguide/image-m2-object-in-background.jpg"
                                     alt="Object in background"/>
                                <div className="result">
                                    <p className="failed">Object in background</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <hr/>

                    <h3 className="heading-medium">4. Stand in the right position</h3>
                    <ul className="list-bullet">
                        <li>You need to stand about 1.5 metres away from the person taking your photo and half a metre
                            from the wall.
                        </li>
                    </ul>
                    <p><img src="/img/photoguide/distance-diagram.png" className="photoguideimg"/></p>


                    <hr/>

                    <h3 className="heading-medium">5. Check the space around your head and shoulders</h3>
                    <ul className="list-bullet">
                        <li>Make sure there’s enough room around your head and shoulders.</li>
                        <li>The person taking the photo may have to move if there’s not.</li>
                        <li>Don’t worry about cropping the photo – we’ll do that for you when you submit your
                            application.
                        </li>
                    </ul>
                    <p><img src="/img/photoguide/diagram_too_close_photo.png" className="photoguideimg"/></p>


                    <hr/>

                    <h3 className="heading-medium">6. Check the lighting</h3>
                    <ul className="list-bullet">
                        <li>There shouldn’t be any shadows on your face or behind your head.</li>
                        <li>Make sure that you use natural light (eg a large window facing you).</li>
                        <li>Make sure that the lighting is even – don’t stand too close to a lamp that’s switched on.
                        </li>
                    </ul>
                    <p><img src="/img/photoguide/lighting-diagram.png" className="photoguideimg"/></p>

                    <div className="guidance-photos" aria-hidden="true">
                        <ul>
                            <li>
                                <img src="img/photoguide/image-m1-plain.jpg" alt="Approved"/>
                                <div className="result">
                                    <p className="approved">Approved</p>
                                </div>
                            </li>
                            <li>
                                <img src="img/photoguide/image-m1-uneven-harsh.jpg" alt="Uneven lighting"/>
                                <div className="result">
                                    <p className="failed">Uneven lighting</p>
                                </div>
                            </li>
                            <li>
                                <img src="img/photoguide/image-m1-flash-shadow.jpg" alt="Avoid shadows"/>
                                <div className="result">
                                    <p className="failed">Avoid shadows</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <hr/>

                    <h3 className="heading-medium">7. Take off any headwear</h3>
                    <ul className="list-bullet">
                        <li>Please remove any headwear unless worn for religious or medical reasons.</li>
                        <li>You must take off anything else that may obstruct the photo, like hair clips or glasses.
                        </li>
                        <li>Make sure that the lighting is even – don’t stand too close to a lamp that’s switched on.
                        </li>
                    </ul>
                    <div className="guidance-photos" aria-hidden="true">
                        <ul>
                            <li>
                                <img src="img/photoguide/image-f2-religious-head-covering.jpg" alt="Approved"/>
                                <div className="result">
                                    <p className="approved">Approved</p>
                                </div>
                            </li>
                            <li>
                                <img src="img/photoguide/image-m3-head-covering.jpg" alt="No fashion hair covering"/>
                                <div className="result">
                                    <p className="failed">No fashion hair covering</p>
                                </div>
                            </li>
                            <li>
                                <img src="img/photoguide/image-f1-hair-accessory.jpg" alt="No hair accessories"/>
                                <div className="result">
                                    <p className="failed">No hair accessories</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <hr/>

                    <h3 className="heading-medium">8. Make sure your face is visible</h3>
                    <ul className="list-bullet">
                        <li>You must be able to see your whole face in the photo.</li>
                        <li>Tie your hair back if you need to.</li>
                    </ul>
                    <div className="guidance-photos" aria-hidden="true">
                        <ul>
                            <li>
                                <img src="img/photoguide/image-f1-plain.jpg" alt="Approved"/>
                                <div className="result">
                                    <p className="approved">Approved</p>
                                </div>
                            </li>
                            <li>
                                <img src="img/photoguide/image-f1-hair-over-eye.jpg" alt="Keep hair away from eyes"/>
                                <div className="result">
                                    <p className="failed">Keep hair away from eyes</p>
                                </div>
                            </li>
                            <li>
                                <img src="img/photoguide/image-f2-headscarf-covering-eye.jpg"
                                     alt="Avoid covering face"/>
                                <div className="result">
                                    <p className="failed">Avoid covering face</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <hr/>

                    <h3 className="heading-medium">9. Make sure your eyes are visible</h3>
                    <ul className="list-bullet">
                        <li>It’s better to remove your glasses if you can – reflections make it hard to see your eyes.
                        </li>
                        <li>If you need to wear them make sure they’re not tinted and there’s no glare on the lens.</li>
                        <li>Your photo will be rejected if your eyes can’t be seen clearly.</li>
                    </ul>
                    <div className="guidance-photos" aria-hidden="true">
                        <ul>
                            <div>
                                <li>
                                    <img src="img/photoguide/image-m2-plain.jpg" alt="Approved"/>
                                    <div className="result">
                                        <p className="approved">Approved</p>
                                    </div>
                                </li>
                                <li>
                                    <img src="img/photoguide/image-m2-plain-glasses.jpg" alt="Approved"/>
                                    <div className="result">
                                        <p className="approved">Approved</p>
                                    </div>
                                </li>
                            </div>
                            <div>
                                <li>
                                    <img src="img/photoguide/image-m2-glasses-reflection.jpg"
                                         alt="No glare on glasses"/>
                                    <div className="result">
                                        <p className="failed">No glare on glasses</p>
                                    </div>
                                </li>
                                <li>
                                    <img src="img/photoguide/image-m2-glasses-tinted-covering-eyes.jpg"
                                         alt="Eyes not clear."/>
                                    <div className="result">
                                        <p className="failed">Eyes not clear.<br/>No tinted lenses</p>
                                    </div>
                                </li>
                            </div>
                        </ul>
                    </div>

                    <hr/>

                    <h3 className="heading-medium">10. Face the camera with a plain expression</h3>
                    <ul className="list-bullet">
                        <li>You must be facing forward and looking straight at the camera.</li>
                        <li>Make sure your expression is neutral and your mouth is closed.</li>
                    </ul>
                    <div className="guidance-photos" aria-hidden="true">
                        <ul>
                            <li>
                                <img src="img/photoguide/image-f1-plain.jpg" alt="Approved"/>
                                <div className="result">
                                    <p className="approved">Approved</p>
                                </div>
                            </li>
                            <li>
                                <img src="img/photoguide/image-f1-smiling.jpg" alt="Don’t smile"/>
                                <div className="result">
                                    <p className="failed">Don’t smile</p>
                                </div>
                            </li>
                            <li>
                                <img src="img/photoguide/image-f1-mouth-open.jpg" alt="Mouth open"/>
                                <div className="result">
                                    <p className="failed">Mouth open</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <hr/>

                    <h3 className="heading-medium">11. Check quality of photo</h3>
                    <ul className="list-bullet">
                        <li>Your photo must be clear, in focus and unedited by computer software.</li>
                        <li>You won’t be able to use the photo if you have ‘red-eye’.</li>
                    </ul>
                </div>
            </div>
        )
    }

})

module.exports = PhotoGuide
