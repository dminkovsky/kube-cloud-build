import selectImages from '../src/select-images';

describe('`selectImages()`', () => {

    test('works', async () => {
        const inquirer = jest.fn().mockReturnValue(Promise.resolve({images: ['image2']}));
        const selectedImages = await selectImages({inquirer})([
            {image: {fullname: 'image1'}},
            {image: {fullname: 'image2'}},
        ]);
        expect(selectedImages).toEqual([
            {image: {fullname: 'image2'}},
        ]);
        expect(inquirer).toHaveBeenCalledWith({
            type: 'checkbox',
            message: 'The following images are missing from Google Container Registry. Choose the ones you want to build:',
            name: 'images',
            choices: [{name: 'image1'}, {name: 'image2'}],
        });
    });
});

