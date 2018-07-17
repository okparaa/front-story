import { h, Component, cloneElement } from 'preact';
import { Link } from 'preact-router/match';
import registerReducer, { 
    fetchRegistrationForm, 
    updateControls, 
    openModal, 
    closeModal,
    selectedBox,
    savePreview,
    registerUser
 } from '@/modules/register/register-ducks';
import '@/public/styles/register.scss';
import { bindActionCreators } from 'redux';
import { connect } from 'preact-redux';
import { addReducer } from '@/components/add-reducer';
import Input from '@/components/controls';
import Header from '@/components/header';
import utils from '@/utils/utils';
import loadImage from 'blueimp-load-image';
import Croppr from 'croppr';

class Register extends Component{
    register = (e) => {
        e.preventDefault();
        let { controls, updateKey, updateControls } = this.props;
        updateKey = utils.guid();
        let isValid = true;
        Object.keys(this.props.controls).map(key => {
            if(!!controls[key].value == false && key !=='id') {
                isValid = false;
                console.log(`there is still error in ${key} ${controls[key].error}`)                    
                controls[key].error = 'value is required';
                if(controls[key].type.toLowerCase() !== 'file'){
                    controls[key].attributes.class += ' error';
                }
                controls[key].attributes.hintclass += ' texterror';
            }
        });
        updateControls(controls, updateKey);
        if(true){
            this.props.registerUser();
        } 
    }
    handleChange = (e) => {
        let { controls, updateControls, updateKey } = this.props;
        updateKey = utils.guid();
        let small = e.target.parentNode.parentNode.querySelector('small');
        controls[e.target.name].value = e.target.value;
        if(utils.hasClass(e.target, 'error')){
            utils.removeClass(e.target, 'error');
            utils.removeClass(small, 'texterror');
            small.innerHTML = controls[e.target.name].hint;
            controls[e.target.name].error = null;
            if(e.target.type !== 'radio'){
                controls[e.target.name].attributes.class = 'input';
            }
            controls[e.target.name].attributes.hintclass = 'help';
        }
        updateControls(controls, updateKey);
	}
    displayControls = (controls) => {
        let { modalOpen } = this.props;
        if(controls){
            controls = utils.sortObjects(controls, 'order');
            return Object.keys(controls).map(key => {
                return ( 
                    <div class="control">
                        { controls[key].type.toLowerCase() !=='file' && !modalOpen && <Input control={controls[key]} change={this.handleChange} />}
                        { controls[key].type.toLowerCase() ==='file' && <Input control={controls[key]} change={this.selectImage} modalOpen={modalOpen} cropImage={this.cropImage} cancelCrop={this.cancelCrop} />}
                    </div>
                )
            })
        }
    }
    cancelCrop = (e) => {
        e.preventDefault();
        this.props.closeModal();        
        this.props.controls.passport.value = '';
        //reset the file input
        var passport = document.querySelector('#passport');
        passport.value = '';
        var passview = document.querySelector('#passview');
        passview.insertAdjacentElement('afterBegin', this.props.preview);
        var containa = document.querySelectorAll('.croppr-container');
        if(containa.length){
            Array.prototype.forEach.call( containa, function( node ) {
                node.parentNode.removeChild( node );
            });
        }
    }
    cropImage = (control) => {
        if(control.info){
            control.hint = control.info;
        }
        let { cropbox, closeModal, controls } = this.props;
        var image = document.querySelector('.croppr-image');
        var tnCanvas = document.createElement('canvas');
        var newWidth = cropbox.width;
        var newHeigth = cropbox.height;
        tnCanvas.width = newWidth;          
        tnCanvas.height = newHeigth;
        var tnCtx = tnCanvas.getContext('2d');
        var bufferCanvas = document.createElement('canvas');
        var bufferCtx = bufferCanvas.getContext('2d');
        
        bufferCanvas.width = image.width + 1000;
        bufferCanvas.height = image.height + 1000;
        bufferCtx.drawImage(image, 0, 0);
        tnCtx.drawImage(bufferCanvas, 
                cropbox.x, 
                cropbox.y,
                newWidth, newHeigth,
                0, 0, newWidth, newHeigth);
        var prevew = document.createElement('img');
        prevew.id = 'prevew';
        prevew.src = tnCanvas.toDataURL("image/jpeg");
        //save the blob in the file control           
        controls.passport.value = this.dataURLtoBlob(tnCanvas.toDataURL("image/jpeg"));
        var passview = document.querySelector('#passview');
        var containa = document.querySelectorAll('.croppr-container');
        if(containa.length){
            Array.prototype.forEach.call( containa, function( node ) {
                node.parentNode.removeChild( node );
            });
        }
        closeModal();
        passview.insertAdjacentElement('afterBegin', prevew);
    }
    selectImage = (e) => {
        var imgPrevew = document.querySelector('#prevew');
        if(imgPrevew){
            this.props.savePreview(imgPrevew);
            imgPrevew.parentNode.removeChild(imgPrevew);
        }
        let { selectedBox, openModal } = this.props;
        var prevew = document.createElement('img');
        prevew.id = 'prevew';
        var containa = document.querySelectorAll('.croppr-container');
        var passview = document.querySelector('#passview');
        passview.insertAdjacentElement('afterBegin', prevew);
        if(containa.length){
            Array.prototype.forEach.call( containa, function( node ) {
                node.parentNode.removeChild( node );
            });
        }
            //console.log(containa.length);     
        var loadingImage = loadImage(
            e.target.files[0],
            function (img) {
                prevew.src = img.toDataURL("image/jpeg"); 
                prevew.style.display = 'block';
                var croppr = new Croppr('#prevew', {
                    aspectRatio: 1,
                    onCropEnd: function(data){
                       selectedBox(data);
                    },
                    onInitialize: function(instance){
                        selectedBox(instance.getValue());                            
                    }
                });
                openModal();                   
            },
            {
                maxHeight: 400,
                canvas: true,
                pixelRatio: window.devicePixelRatio,
                downsamplingRatio: 0.3,
                orientation: true
            }
        );
        if (!loadingImage) {
            console.log('image failed to load'); 
            return;      
        }
    }
    dataURLtoBlob = (dataurl) => {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }            
        return new Blob([u8arr], {type:mime});
    }
    componentDidMount(){
        this.props.fetchRegistrationForm();
    }
    shouldComponentUpdate(nextProps, nextState){
        return nextProps.controls !== this.props.controls;
    }
    render(){
        let {controls, cropbox, modalOpen, closeModal, openModal} = this.props;
        console.log(controls);
        return (
            <div class="container">
                <div class="row">
                    <div class="leftside">
                        this is the left side
                    </div>
                    <div class="content">
                        <form class="" onSubmit={this.register}>
                            {this.displayControls(controls)}
                            { !!controls && controls.hasOwnProperty('id') && !modalOpen && <button class="btn">Register</button>}
                        </form>
                    </div>
                    <div class="rightside">
                        this is the right side
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({ register }, props) => {
    if(!register)
        return {};
    
    return {
        controls: register.controls,
        loading: register.loading,
        error: register.error,
        modalOpen: register.modalOpen || false,
        updateKey: register.updateKey,
        cropbox: register.cropbox,
        preview: register.preview,
    }
} 

Register = addReducer('register', registerReducer)(Register)
export default connect(mapStateToProps, { 
    fetchRegistrationForm, 
    updateControls,
    openModal,
    closeModal,
    selectedBox,
    savePreview,
    registerUser
})(Register);